import axios from 'axios';
import { WeatherData, ForecastData } from '../types/api';

const WEATHER_API_KEY = '';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  private isApiKeyValid(): boolean {
    return false;
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      console.log('🌤️ Using mock weather data for demo');
      return this.getMockWeatherData(lat, lon);

      /* Uncomment this for real API usage:
      if (!this.isApiKeyValid()) {
        throw new Error('Weather API key not configured');
      }

      console.log('🌤️ Fetching weather for:', lat, lon);

      const response = await axios.get(
        `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`,
      );

      console.log('✅ Weather data received:', response.data.name);
      return response.data;
      */
    } catch (error: any) {
      console.error(' Weather API Error:', error);

      return this.getMockWeatherData(lat, lon);
    }
  }

  async getForecast(lat: number, lon: number): Promise<ForecastData> {
    try {
      // Always use mock data for demo
      return this.getMockForecastData();
    } catch (error) {
      console.error('Forecast API Error:', error);
      return this.getMockForecastData();
    }
  }

  private getMockWeatherData(lat: number, lon: number): WeatherData {
    console.log('🔄 Using mock weather data');

    const area = this.getDublinAreaName(lat, lon);
    const temp = 10 + Math.floor(Math.random() * 8);
    const conditions = [
      { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
      { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' },
      { id: 803, main: 'Clouds', description: 'broken clouds', icon: '04d' },
      { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
      {
        id: 300,
        main: 'Drizzle',
        description: 'light intensity drizzle',
        icon: '09d',
      },
    ];

    const randomCondition =
      conditions[Math.floor(Math.random() * conditions.length)];

    return {
      coord: { lon, lat },
      weather: [randomCondition],
      main: {
        temp: temp,
        feels_like: temp - 1,
        temp_min: temp - 2,
        temp_max: temp + 2,
        pressure: 1015,
        humidity: 60 + Math.floor(Math.random() * 30),
      },
      wind: {
        speed: 3.5 + Math.random() * 5,
        deg: 230,
      },
      clouds: {
        all: Math.floor(Math.random() * 100),
      },
      dt: Math.floor(Date.now() / 1000),
      sys: {
        country: 'IE',
        sunrise: Math.floor(Date.now() / 1000) - 3600,
        sunset: Math.floor(Date.now() / 1000) + 3600,
      },
      timezone: 3600,
      id: 2964574,
      name: area,
      cod: 200,
    };
  }

  private getMockForecastData(): ForecastData {
    return {
      list: [
        {
          dt: Math.floor(Date.now() / 1000) + 3600,
          main: {
            temp: 15,
            feels_like: 14,
            temp_min: 14,
            temp_max: 16,
            pressure: 1015,
            humidity: 60,
          },
          weather: [
            {
              id: 801,
              main: 'Clouds',
              description: 'few clouds',
              icon: '02d',
            },
          ],
          wind: {
            speed: 4.1,
            deg: 250,
          },
          dt_txt: new Date(Date.now() + 3600000).toISOString(),
        },
      ],
      city: {
        name: 'Dublin',
        country: 'IE',
        coord: {
          lat: 53.3498,
          lon: -6.2603,
        },
      },
    };
  }

  async getLocationName(lat: number, lon: number): Promise<string> {
    try {
      // Use the enhanced Dublin area detection
      return this.getDublinAreaName(lat, lon);
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
      return this.getDublinAreaName(lat, lon);
    }
  }

  // Enhanced Dublin area detection - MAKE THIS PUBLIC
  getDublinAreaName(lat: number, lon: number): string {
    const dublinAreas = [
      { name: 'Dublin City Centre', lat: 53.3498, lon: -6.2603, radius: 2 },
      { name: 'Temple Bar', lat: 53.3455, lon: -6.267, radius: 1 },
      { name: "O'Connell Street", lat: 53.3494, lon: -6.2602, radius: 0.5 },
      { name: 'Grafton Street', lat: 53.3425, lon: -6.2603, radius: 0.5 },
      { name: "St. Stephen's Green", lat: 53.3384, lon: -6.261, radius: 1 },
      { name: 'Phoenix Park', lat: 53.3559, lon: -6.3297, radius: 2 },
      { name: 'Docklands', lat: 53.3477, lon: -6.2387, radius: 1.5 },
      { name: 'Rathmines', lat: 53.3204, lon: -6.2654, radius: 1.5 },
      { name: 'Ranelagh', lat: 53.3261, lon: -6.2564, radius: 1 },
      { name: 'Ballsbridge', lat: 53.3286, lon: -6.2336, radius: 1.5 },
      { name: 'Donnybrook', lat: 53.3212, lon: -6.2229, radius: 1 },
      { name: 'Liffey Valley', lat: 53.356, lon: -6.394, radius: 2 },
      { name: 'Blanchardstown', lat: 53.3884, lon: -6.3756, radius: 3 },
      { name: 'Sandyford', lat: 53.2749, lon: -6.2243, radius: 2 },
      { name: 'Swords', lat: 53.4591, lon: -6.2181, radius: 3 },
      { name: 'Dún Laoghaire', lat: 53.2944, lon: -6.1339, radius: 2 },
    ];

    for (const area of dublinAreas) {
      const distance = this.calculateDistance(lat, lon, area.lat, area.lon);
      if (distance <= area.radius) {
        return area.name;
      }
    }

    const distanceFromCentre = this.calculateDistance(
      lat,
      lon,
      53.3498,
      -6.2603,
    );
    if (distanceFromCentre <= 15) {
      return 'Dublin';
    } else if (distanceFromCentre <= 40) {
      return 'County Dublin';
    }

    return `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export default WeatherService;
