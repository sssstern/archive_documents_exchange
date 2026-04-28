import React from 'react';
import { IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  return (
    <IconButton 
      onClick={toggleTheme}
      className="theme-toggle-btn"
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 2000,
        bgcolor: 'primary.main',
        color: 'white',
        '&:hover': { bgcolor: 'primary.dark' }
      }}
    >
      {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
};