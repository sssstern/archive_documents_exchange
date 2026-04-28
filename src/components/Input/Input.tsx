import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useUser } from "../../hooks/useUser";
import { RootState } from "../../store/store";
import { setPage } from "../../store/archiveSlice";
import { Message } from "../../consts";
import { Button, TextField, Box } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import './Input.css';

type InputProps = {
  ws: WebSocket | null | undefined;
  setMessageArray: React.Dispatch<React.SetStateAction<Message[]>>;
};

export const Input: React.FC<InputProps> = ({ ws, setMessageArray }) => {
  const { login } = useUser();
  const dispatch = useDispatch();
  const { selectedBookId, currentPage } = useSelector((state: RootState) => state.archive);

  const handleClickSendMessBtn = () => {
    if (ws && ws.readyState === WebSocket.OPEN && selectedBookId) {
      const message: any = {
        username: login || 'User',
        send_time: new Date().toISOString(),
        payload: { 
          document_id: selectedBookId, 
          page_id: Number(currentPage)
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
          value={currentPage}
          onChange={(e) => dispatch(setPage(Number(e.target.value)))}
          InputProps={{ inputProps: { min: 1 } }}
          className="chat-input-field"
        />
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleClickSendMessBtn}
          disabled={!selectedBookId || !ws}
          className="chat-input-button"
        >
          Запросить страницу
        </Button>
      </div>
    </Box>
  );
};