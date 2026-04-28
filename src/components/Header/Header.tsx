import React from 'react';
import { Box, Typography } from '@mui/material';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <Box component="header" className="global-header">
      <div className="header-content">
        <img src="./logo.png" alt="Logo" className="header-logo" />
        <Typography variant="h1" className="header-title">
          Обмен архивными документами
        </Typography>
      </div>
    </Box>
  );
};