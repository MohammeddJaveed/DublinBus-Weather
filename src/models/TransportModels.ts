// src/models/TransportModels.ts

export interface BusStop {
  stop_id: string;
  stop_code?: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  zone_id?: string;
  stop_url?: string;
  location_type?: number;
  parent_station?: string;
}

export interface BusRoute {
  route_id: string;
  route_short_name: string;
  route_long_name?: string;
  route_type?: number;
  route_color?: string;
  route_text_color?: string;
}

