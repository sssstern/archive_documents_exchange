import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useUser } from "../../hooks/useUser";
import { RootState } from "../../store/store";
import { setPage } from "../../store/archiveSlice";
import { Message } from "../../consts";
import { Button, TextField, Box } from "@mui/material";
import './Input.css';

type InputProps = {
  ws: WebSocket | null | undefined;
  setMessageArray: React.Dispatch<React.SetStateAction<Message[]>>;
};

export const Input: React.FC<InputProps> = ({ ws, setMessageArray }) => {
  const { login } = useUser();
  const dispatch = useDispatch();
  
  // Получаем данные из Redux[cite: 16]
  const { availableBooks, selectedBookId, currentPage } = useSelector((state: RootState) => state.archive);

  // Локальное состояние для управления текстом в поле ввода[cite: 16]
  const [inputValue, setInputValue] = useState<string>(String(currentPage));

  // Определяем лимиты страниц для выбранной книги[cite: 16]
  const selectedBook = availableBooks.find(book => book.id === selectedBookId);
  const maxPages = selectedBook ? selectedBook.pages : 1;

  // Синхронизируем локальное поле с Redux[cite: 16]
  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Обновляем визуальное отображение (позволяет стирать)[cite: 16]
    setInputValue(val);

    if (val === "") return;

    let num = Number(val);

    // Ограничиваем вводимое число рамками документа[cite: 16]
    if (num > maxPages) num = maxPages;
    if (num < 1) num = 1;

    // Обновляем глобальный стейт только валидным числом[cite: 16]
    dispatch(setPage(num));
  };

  const handleBlur = () => {
    // Если поле пустое при выходе — возвращаем "1"[cite: 16]
    if (inputValue === "" || Number(inputValue) < 1) {
      setInputValue("1");
      dispatch(setPage(1));
    } else {
      setInputValue(String(currentPage));
    }
  };

  const handleClickSendMessBtn = () => {
    if (ws && ws.readyState === WebSocket.OPEN && selectedBookId) {
      const message: any = {
        username: login || 'User',
        send_time: new Date().toISOString(),
        payload: { 
          document_id: selectedBookId, 
          page_id: Number(currentPage) || 1
        }
      };
      ws.send(JSON.stringify(message));
      setMessageArray((prev) => [...prev, message]);
    }
  };
  
  return (
    <Box className="chat-input-container">
      <div className="chat-input-controls">
        <TextField
          label="Номер страницы"
          type="number"
          variant="outlined"
          size="small"
          value={inputValue}
          onChange={handlePageChange}
          onBlur={handleBlur}
          InputProps={{ inputProps: { min: 1, max: maxPages } }}
          className="chat-input-field"
          disabled={!selectedBookId}
        />
        <Button 
          variant="contained" 
          onClick={handleClickSendMessBtn}
          disabled={!selectedBookId || !ws || !currentPage}
          className="chat-input-button"
        >
          Запросить страницу
        </Button>
      </div>
    </Box>
  );
};