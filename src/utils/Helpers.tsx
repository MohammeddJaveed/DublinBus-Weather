import React from 'react';
import moment from 'moment';

export const formatTime = (timestamp: string | number): string => {
  return moment(Number(timestamp) * 1000).format('HH:mm');
};

export const calculateETA = (delay: number): string => {
  const now = moment();
  const arrivalTime = now.add(delay, 'seconds');
  return arrivalTime.format('HH:mm');
};

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`;
};

export const getTrafficLevel = (delay: number) => {
  if (delay < 300) {
    return { level: 'light', color: '#27AE60', label: 'Light traffic' };
  } else if (delay < 900) {
    return { level: 'moderate', color: '#F39C12', label: 'Moderate traffic' };
  } else {
    return { level: 'heavy', color: '#E74C3C', label: 'Heavy traffic' };
  }
};
