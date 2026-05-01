import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Message } from "../../consts";
import { Box, Typography, Tooltip } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useUser } from "../../hooks/useUser";
import './MessageCard.css';

export const MessageCard: React.FC<{ msg: Message }> = ({ msg }) => {
  const { login } = useUser();
  
  // Получаем массив доступных книг из Redux Store[cite: 17]
  const { availableBooks } = useSelector((state: RootState) => state.archive);

  // Сопоставление ID и названия из JSON[cite: 17]
  const getDocumentTitle = (docId: string | number | undefined) => {
    if (!docId) return 'Документ не выбран';
    const book = availableBooks.find(b => String(b.id) === String(docId));
    return book ? book.title : docId;
  };

  // Определение типа сообщения[cite: 17]
  const isSystemMessage = msg.error || msg.payload?.file || msg.username === 'SYSTEM_MOCK';
  const isOwnMessage = !isSystemMessage && msg.username === login;

  // Обработка ошибок[cite: 17]
  if (msg.error) {
    return (
      <div className={`message-card-wrapper ${isOwnMessage ? 'message-card-wrapper--own' : 'message-card-wrapper--alien'}`}>
        <Box className="message-card--error">
          <div className="message-card__header">
            <span className="message-card__username">АРХИВ</span>
            <span className="message-card__time">
               {msg.send_time ? new Date(msg.send_time).toLocaleTimeString() : ''}
            </span>
          </div>
          <Tooltip title={msg.error}>
            <ErrorOutlineIcon color="error" fontSize="large" />
          </Tooltip>
        </Box>
      </div>
    );
  }

  // Форматирование Base64[cite: 17]
  const formatImageSrc = (payloadFile: string) => {
    if (payloadFile.startsWith('data:image')) return payloadFile;
    return `data:image/png;base64,${payloadFile}`;
  };

  return (
    <div className={`message-card-wrapper ${isOwnMessage ? 'message-card-wrapper--own' : 'message-card-wrapper--alien'}`}>
      <Box className={`message-card ${isOwnMessage ? 'message-card--own' : 'message-card--alien'}`}>
        <div className="message-card__header">
          <span className="message-card__username">{isSystemMessage ? "АРХИВ" : msg.username}</span>
          <span className="message-card__time">
            {msg.send_time ? new Date(msg.send_time).toLocaleTimeString() : ''}
          </span>
        </div>
        
        <div className="message-card__body">
          <Typography className="message-card__content">
            Документ: {getDocumentTitle(msg.payload?.document_id)}, cтр: {msg.payload?.page_id}
          </Typography>
          {msg.payload?.file && (
            <div className="message-card__image-container">
              <img 
                src={formatImageSrc(msg.payload.file)} 
                alt="Archive Page" 
                className="message-card__image" 
              />
            </div>
          )}
        </div>
      </Box>
    </div>
  );
};