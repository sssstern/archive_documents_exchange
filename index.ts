import express from 'express';
import axios from 'axios';
import http from 'http';
import ws, { type WebSocket } from 'ws';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cors from 'cors';

const swaggerDocument = YAML.load('./swagger.yaml');

// Конфигурация IP и портов
const port: number = Number(process.env.PORT ?? 8001);
const hostname = '0.0.0.0'; // Слушаем все интерфейсы для доступа из ZeroTier
const transportURL = process.env.TRANSPORT_URL ?? 'http://10.205.157.61:8080/process';

interface IncomingPayload {
  document_id?: string | number;
  page_id?: number | string;
  page_number?: number | string;
  file?: string;
}

interface IncomingMessage {
  username: string;
  send_time?: string;
  payload: IncomingPayload;
  error?: string;
}

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const wss = new ws.WebSocketServer({ server });

// 1. HTTP вход с транспортного уровня — АДРЕСНАЯ РАССЫЛКА
app.post('/api/receive', (req, res) => {
  const message: IncomingMessage = req.body;
  const targetUsername = message.username; 

  console.log(`[receive] от транспорта для пользователя "${targetUsername}": doc=${message.payload?.document_id}, page=${message.payload?.page_id}`);

  let delivered = false;

  // Ищем конкретного клиента по его сохраненному имени
  wss.clients.forEach((client: any) => {
    if (client.readyState === ws.OPEN && client.username === targetUsername) {
      client.send(JSON.stringify(message));
      delivered = true;
    }
  });

  if (delivered) {
    res.status(200).send({ status: 'delivered' });
  } else {
    console.warn(`[warn] Сообщение не доставлено: пользователь "${targetUsername}" не в сети`);
    res.status(404).send({ error: 'User not connected' });
  }
});

// 2. WebSocket соединение — ИДЕНТИФИКАЦИЯ
wss.on('connection', (websocketConnection: WebSocket, req) => {
  const urlParams = new URLSearchParams(req.url?.split('?')[1]);
  const username = urlParams.get('username') ?? 'Anonymous';

  // Сохраняем имя пользователя прямо в объект сокета для фильтрации в будущем
  (websocketConnection as any).username = username;

  console.log(`[ws] Пользователь "${username}" подключён`);

  websocketConnection.on('message', async (raw: ws.RawData) => {
    try {
      const message = JSON.parse(raw.toString()) as IncomingMessage;
      const docId = message.payload?.document_id;
      const pageRaw = message.payload?.page_id ?? message.payload?.page_number;
      const pageId = Number(pageRaw);

      if (docId === undefined || docId === null || isNaN(pageId)) {
        console.error('[error] Некорректный payload от клиента:', message.payload);
        return;
      }

      const transportPayload = {
        document_id: String(docId),
        page_id: pageId,
        username: username, // Передаем имя того, кто сделал запрос
      };

      console.log(`[proxy] -> транспорт (${transportURL}) для ${username}`, transportPayload);
      
      // Отправляем запрос на транспортный уровень (Go)
      await axios.post(transportURL, transportPayload, { timeout: 30000 });
      
    } catch (e: any) {
      console.error(`[error] Ошибка транспорта для ${username}:`, e.message ?? e);
      
      // Уведомляем клиента об ошибке
      try {
        websocketConnection.send(JSON.stringify({
          username: 'SYSTEM_MOCK',
          send_time: new Date().toISOString(),
          payload: {},
          error: `Ошибка связи с транспортным уровнем: ${e.message ?? e}`,
        }));
      } catch (sendError) {
        console.error('Не удалось отправить ошибку клиенту', sendError);
      }
    }
  });

  websocketConnection.on('close', () => {
    console.log(`[ws] Пользователь "${username}" отключился`);
  });
});

server.listen(port, hostname, () => {
  console.log(`
  ✅ Прикладной уровень (Proxy) запущен
  --------------------------------------------------
  Локальный адрес:  http://${hostname}:${port}
  Swagger UI:       http://${hostname}:${port}/api-docs
  Транспорт (Go):   ${transportURL}
  --------------------------------------------------
  `);
});