import React from 'react';

// Weather API Types
export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
}

export interface ForecastData {
  list: Array<{
    dt: number;
    main: WeatherData['main'];
    weather: WeatherData['weather'];
    dt_txt: string;
  }>;
}

// Transport API Types
export interface TransportData {
  id: string;
  trip_update?: {
    trip: {
      trip_id: string;
      route_id: string;
      direction_id: number;
    };
    stop_time_update: Array<{
      arrival: {
        delay: number;
      };
      stop_id: string;
    }>;
    vehicle: {
      id: string;
    };
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface BusRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
}

export interface JourneyPlan {
  startLocation: LocationData;
  endLocation: LocationData;
  duration: number;
  buses: TransportData[];
  weather: WeatherData;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface EnhancedBusData {
  id: string;
  route: string;
  routeId: string;
  vehicleId: string;
  latitude?: number;
  longitude?: number;
  delay: number;
  traffic: 'light' | 'moderate' | 'heavy';
  timestamp?: string;
  destination: string;
  stops: number;
  eta: string;
  duration: string;
}
