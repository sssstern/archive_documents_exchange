import { useUser } from "../../hooks/useUser";
import { Message } from "../../consts";
import { Input } from "../Input/Input";
import { MessageCard } from "../MessageCard/MessageCard";
import { Button, Typography, Box } from "@mui/material";
import React from "react";
import './Chat.css';

type ChatProps = {
  ws: WebSocket | null | undefined;
  messageArray: Message[];
  setMessageArray: React.Dispatch<React.SetStateAction<Message[]>>;
  onLogout: () => void;
}

export const Chat: React.FC<ChatProps> = ({ ws, messageArray, setMessageArray, onLogout }) => {
  const { login } = useUser();

  return (
    <Box className="chat-page">
      <div className="chat-header">
        <Typography variant="h6" className="chat-header__title">
          Пользователь: <span className="user-name">{login}</span>
        </Typography>
        <Button
          variant="contained" 
          onClick={onLogout}
          className="chat-header__logout"
        >
          Выйти
        </Button>
      </div>

      <div className="chat-body">
        {messageArray.length > 0 ? (
          <div className="chat-messages">
            {messageArray.map((msg, index) => (
              <MessageCard key={index} msg={msg} />
            ))}
          </div>
        ) : (
          <div className="chat-empty">
            <Typography className="chat-empty__text" color="textSecondary">История сообщений пуста</Typography>
          </div>
        )}
      </div>

      <div className="chat-footer">
        <Input ws={ws} setMessageArray={setMessageArray} />
      </div>
    </Box>
  );
};