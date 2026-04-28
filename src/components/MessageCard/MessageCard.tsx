import React from 'react';
import { Message } from "../../consts";
import { Box, Typography, Tooltip } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useUser } from "../../hooks/useUser";
import './MessageCard.css';

export const MessageCard: React.FC<{ msg: Message }> = ({ msg }) => {
  const { login } = useUser();
  const isOwnMessage = msg.username === login;

  // Если пришел признак ошибки
  if (msg.error) {
    return (
      <div className={`message-card-wrapper ${isOwnMessage ? 'message-card-wrapper--own' : 'message-card-wrapper--alien'}`}>
        <Box className="message-card--error">
          <Tooltip title={msg.error}>
            <ErrorOutlineIcon color="error" fontSize="large" />
          </Tooltip>
          {/* Текст и файлы здесь не рендерятся согласно заданию */}
        </Box>
      </div>
    );
  }

  // Обычный рендер сообщения (если ошибки нет)
  const formatImageSrc = (payloadFile: string) => {
    if (payloadFile.startsWith('data:image')) return payloadFile;
    return `data:image/png;base64,${payloadFile}`;
  };

  return (
    <div className={`message-card-wrapper ${isOwnMessage ? 'message-card-wrapper--own' : 'message-card-wrapper--alien'}`}>
      <Box className={`message-card ${isOwnMessage ? 'message-card--own' : 'message-card--alien'}`}>
        <div className="message-card__header">
          <span className="message-card__username">{msg.username}</span>
          <span className="message-card__time">
            {msg.send_time ? new Date(msg.send_time).toLocaleTimeString() : ''}
          </span>
        </div>
        
        <div className="message-card__body">
          <Typography variant="body2">
            Документ: {msg.payload?.document_id}, стр: {msg.payload?.page_id}
          </Typography>

          {msg.payload?.file && (
            <div className="message-card__image-container" style={{ marginTop: '8px' }}>
              <img 
                src={formatImageSrc(msg.payload.file)} 
                alt="Archive Page" 
                style={{ maxWidth: '100%', height: 'auto' }} 
              />
            </div>
          )}
        </div>
      </Box>
    </div>
  );
};