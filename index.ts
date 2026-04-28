import express from 'express';
import axios from 'axios';
import http from 'http';
import ws, { type WebSocket } from 'ws';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cors from 'cors';
const swaggerDocument = YAML.load('./swagger.yaml'); // путь к твоему файлу



const port: number = 8001; 
const hostname = '0.0.0.0';
const transportLevelPort = 8080; 
const transportLevelHostname = 'localhost'; // Твой IP из примера

interface Message {
  username: string;
  send_time?: string; 
  payload: {
    document_id?: number;
    page_number?: number;
    file?: string; 
  };
  error?: string; 
}

type Users = Record<string, Array<{ id: number; ws: WebSocket }>>;

const app = express(); 
const server = http.createServer(app);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const wss = new ws.WebSocketServer({ server });
const users: Users = {};

// МЕТОД /api/receive (Получение от транспорта по HTTP и рассылка в WS)
app.post('/api/receive', (req: { body: Message }, res: { sendStatus: (arg0: number) => void }) => {
  const message: Message = req.body;
  // Рассылаем полученный файл/ошибку всем пользователям
  broadcast(message.username, message, true); 
  res.sendStatus(200);
});

// Функция рассылки (аналог sendMessageToOtherUsers)
function broadcast(senderUsername: string, message: Message, sendToAll = false): void {
  const msgString = JSON.stringify(message);
  for (const key in users) {
    // Если sendToAll = true, отправляем всем. Если false - всем, кроме отправителя.
    if (sendToAll || key !== senderUsername) {
      users[key].forEach(element => {
        if (element.ws.readyState === ws.OPEN) {
          element.ws.send(msgString);
        }
      });
    }
  }
}

// Запуск
server.listen(port, hostname, () => {
  console.log(`Прикладной уровень запущен: http://${hostname}:${port}`);
});

const agentPort = 8080; 
const agentHostname = 'localhost';

wss.on('connection', (websocketConnection: WebSocket, req: any) => {
  const url = new URL(req?.url, `http://${req.headers.host}`);
  const username = url.searchParams.get('username');

  if (username) {
    if (username in users) {
      users[username].push({ id: Date.now(), ws: websocketConnection });
    } else {
      users[username] = [{ id: Date.now(), ws: websocketConnection }];
    }
    console.log(`[open] Пользователь ${username} подключен`);
  }

  // МЕТОД /api/send (Обработка входящего сообщения по WebSocket)
  websocketConnection.on('message', async (messageString: string) => {
    try {
      const message = JSON.parse(messageString);
      
      // Берем данные из payload
      const docId = message.payload.document_id;
      // ВАЖНО: проверяем, как называется поле во фронтенде (page_number или page_id)
      const pageNum = Number(message.payload.page_number || message.payload.page_id);
  
      if (isNaN(pageNum)) {
         console.error("[error] Номер страницы не является числом!");
         return;
      }
  
      const agentPayload = {
        document_id: String(docId),
        page_id: pageNum
      };
  
      console.log(`[proxy] Отправка запроса в Go-агент:`, agentPayload);
      await axios.post(`http://localhost:8080/process`, agentPayload);
  
    } catch (e) {
      console.error('Ошибка:', e.message);
    }
  });

  websocketConnection.on('close', () => {
    if (username && users[username]) {
      delete users[username];
      console.log(`[close] Соединение с ${username} разорвано`);
    }
  });
});