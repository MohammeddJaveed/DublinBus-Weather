import React from 'react';

 const CONFIG = {
  WEATHER_API_KEY: '',
  TRANSPORT_API_KEY: '',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  TRANSPORT_BASE_URL: 'https://api.nationaltransport.ie/gtfsr/v2',
};

 const COLORS = {
  primary: '#00A65A',
  secondary: '#3498DB',
  background: '#F8F9FA',
  text: '#2C3E50',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  lightGray: '#ECF0F1',
  darkGray: '#7F8C8D',
  white: '#FFFFFF',
};

 const STYLES = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

export default { CONFIG, COLORS, STYLES };