import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import archiveReducer from './archiveSlice';

// конфиг для нащщего стора
const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  user: userSlice,  // стор состоит из одного слайса
  archive: archiveReducer,
});

// создаем редьюсера
const persistedReducer = persistReducer(persistConfig, rootReducer);

// конфигурирем стор
export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store); // стор персистентный, чтобы данные сохранялись в localStorage
export type RootState = ReturnType<typeof store.getState>;