import axios from 'axios';
import { WeatherData, ForecastData } from '../types/api';

// Define API keys directly here
const WEATHER_API_KEY = '';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const WeatherService = {
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(
        `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`,
      );
      return response.data;
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  },

  async getForecast(lat: number, lon: number): Promise<ForecastData> {
    try {
      const response = await axios.get(
        `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`,
      );
      return response.data;
    } catch (error) {
      console.error('Forecast API Error:', error);
      throw error;
    }
  },
};

export default WeatherService;
