import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { selectBook } from '../../store/archiveSlice';
import { Card, CardContent, Typography, TextField, InputAdornment, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ArchiveDocument } from "../../store/archiveSlice";
import { useUser } from "../../hooks/useUser"; // Импорт для слежения за логаутом[cite: 2, 19]
import './BookSelector.css';

export const BookSelector = () => {
  const { availableBooks, selectedBookId } = useSelector((state: RootState) => state.archive);
  const { login } = useUser(); // Получаем статус пользователя для сброса поиска[cite: 2]
  const dispatch = useDispatch();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Логика очистки поиска при выходе из профиля[cite: 19]
  useEffect(() => {
    if (!login) {
      setSearchTerm('');
    }
  }, [login]);

  const filteredBooks = availableBooks.filter((book: ArchiveDocument) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="book-selector">
      <div className="book-selector__header">
        <Typography className="book-selector__title">
          Каталог документов
        </Typography>
      </div>

      <div className="book-selector__list">
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder="Поиск"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="book-selector__search-exact"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {filteredBooks.length > 0 ? (
          filteredBooks.map((book: ArchiveDocument) => (
            <Card 
              key={book.id}
              onClick={() => dispatch(selectBook(book.id))}
              className={`book-selector__card ${selectedBookId === book.id ? 'book-selector__card--selected' : ''}`}
              elevation={0}
            >
              <CardContent className="book-selector__card-content">
                <Typography className="book-selector__card-title" title={book.title}>
                  {book.title}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box className="book-selector__empty">
            <Typography variant="body2">Документы не найдены</Typography>
          </Box>
        )}
      </div>
    </Box>
  );
};