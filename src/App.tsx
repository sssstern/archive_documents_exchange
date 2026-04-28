import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch } from "react-redux";
import { 
  createTheme, 
  ThemeProvider, 
  CssBaseline,
  Dialog,
  Box
} from '@mui/material';

import './App.css';
import { useUser } from "./hooks/useUser";
import { Login } from "./components/Login/Login";
import { Message } from "./consts";
import { Chat } from "./components/Chat/Chat";
import { setDocuments } from "./store/archiveSlice";
import { BookSelector } from './components/BookSelector/BookSelector';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import staticDocuments from './data/documents.json';

function App() {
  const dispatch = useDispatch();
  const { login, resetUser } = useUser();
  
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messageArray, setMessageArray] = useState<Message[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#FF1919',
      },
      background: {
        default: isDarkMode ? '#121212' : '#ffffff',
        paper: isDarkMode ? '#1e1e1e' : '#f5f5f5',
      },
    },
    cssVariables: true, 
  }), [isDarkMode]);

  useEffect(() => {
    dispatch(setDocuments(staticDocuments));
  }, [dispatch]);

  const createWebSocket = (url: string) => {
    const newWs = new WebSocket(url);
    newWs.onmessage = (event) => {
      try {
        const newMessage = JSON.parse(event.data);
        setMessageArray((prev) => [...prev, newMessage]);
      } catch (e) {
        console.error("Ошибка парсинга сообщения:", e);
      }
    };
    newWs.onclose = () => setWs(null);
    setWs(newWs);
    return newWs;
  };

  const handleLogout = () => {
    if (ws) ws.close();
    setWs(null);
    setMessageArray([]);
    resetUser();
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Модальное окно — теперь это только маленькая карточка по центру */}
      <Dialog 
        open={!login} 
        disableEscapeKeyDown
        maxWidth={false}
        // Убираем стандартные отступы диалога, чтобы Login управлял ими сам
        PaperProps={{
          sx: { 
            borderRadius: '4px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Login 
            ws={ws} 
            setWs={setWs} 
            createWebSocket={createWebSocket} 
          />
        </Box>
      </Dialog>

      <div className={`app-wrapper ${!login ? 'app-wrapper--overlay' : ''}`}>
        <main className="main-content">
          <aside className="catalog-sidebar">
            <BookSelector />
          </aside>
          <section className="chat-area">
            <Chat 
              ws={ws} 
              messageArray={messageArray} 
              setMessageArray={setMessageArray}
              onLogout={handleLogout}
            />
          </section>
        </main>
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
    </ThemeProvider>
  );
}

export default App;