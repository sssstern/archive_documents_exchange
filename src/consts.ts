
//моя сеть 
export const hostname = '172.26.72.45';
//артем export const hostname = '10.205.157.225';


export type ArchiveDocument = {
  id: string;
  title: string;
  author: string;
  thumbnail: string; // URL обложки
};

export type Message = {
    username: string;
    send_time: string;
    payload: {
      page_id: number;   // Основной параметр
      document_id: string; 
      file?: string;  // ID выбранной книги
    };
    error?: string;          // Поле для признака ошибки
  };