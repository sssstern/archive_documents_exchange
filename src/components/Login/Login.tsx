import React, { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { Button, TextField } from '@mui/material';
import { hostname } from "../../consts";
import './Login.css';

type LoginProps = {
  ws: WebSocket | null;
  setWs: React.Dispatch<React.SetStateAction<WebSocket | null>>;
  createWebSocket: (url: string) => WebSocket;
};

export const Login: React.FC<LoginProps> = ({ ws, setWs, createWebSocket }) => {
  const { login, setUser } = useUser();
  const [userName, setUsername] = useState(login);

  const handleClickSignInBtn = () => {
    if (!userName.trim()) return;
    setUser({ userInfo: { Data: { login: userName } } });
    if (ws) ws.close(1000, 'User enter userName');
    setWs(createWebSocket(`ws://${hostname}:8001/?username=${encodeURIComponent(userName)}`));
  };

  return (
    <div className="login-card"> 
      <h1 className="login-header">Вход</h1>
      <div className="field-wrapper">
        <label className="field-label">Введите имя</label>
        <TextField 
          fullWidth
          variant="outlined" 
          placeholder="Ваше имя"
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleClickSignInBtn()}
        />
      </div>
      
      <div className="login-footer">
        <Button 
          variant="contained" 
          onClick={handleClickSignInBtn}
          className="login-button"
        >
          Войти
        </Button>
      </div>
    </div>
  );
};