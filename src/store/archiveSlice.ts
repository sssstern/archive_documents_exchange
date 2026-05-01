import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ОБЯЗАТЕЛЬНО добавь export здесь
export interface ArchiveDocument {
  id: string;
  title: string;
  pages: number;
}

interface ArchiveState {
  availableBooks: ArchiveDocument[];
  selectedBookId: string | null;
  currentPage: number;
}

const initialState: ArchiveState = {
  availableBooks: [], // Будет заполняться из Mirage JS
  selectedBookId: null,
  currentPage: 1,
};

const archiveSlice = createSlice({
  name: 'archive',
  initialState,
  reducers: {
    selectBook: (state, action: PayloadAction<string>) => {
      state.selectedBookId = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    // Добавляем экшен для загрузки данных из Mirage
    setDocuments: (state, action: PayloadAction<ArchiveDocument[]>) => {
        state.availableBooks = action.payload;
    },
    resetArchive: (state) => {
      state.selectedBookId = null; // Сброс выбранного документа
      state.currentPage = 1;        // Сброс страницы на дефолтную
    }
  },
});

// Проверь, что все экшены перечислены здесь
export const { selectBook, setPage, setDocuments, resetArchive} = archiveSlice.actions;
export default archiveSlice.reducer;