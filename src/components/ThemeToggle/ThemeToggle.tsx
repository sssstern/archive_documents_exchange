import React from 'react';
import { IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import './ThemeToggle.css';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  return (
    <IconButton 
      onClick={toggleTheme}
      className="theme-toggle-btn"
    >
      {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
};