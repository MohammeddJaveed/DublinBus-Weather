import stopsData from '../data/json/stops.json';
import routesData from '../data/json/routes.json';
import type { BusStop, BusRoute } from '../models/transportModels';

class GtfsService {
  loadStops(): BusStop[] {
    return stopsData.map((s: any) => ({
      stop_id: String(s.stop_id),
      stop_code: s.stop_code ? String(s.stop_code) : String(s.stop_id),
      stop_name: s.stop_name || '',
      stop_lat: Number(s.stop_lat),
      stop_lon: Number(s.stop_lon),
      zone_id: s.zone_id || undefined,
      stop_url: s.stop_url || undefined,
      location_type: s.location_type ? Number(s.location_type) : undefined,
      parent_station: s.parent_station || undefined,
    }));
  }

  loadRoutes(): BusRoute[] {
    return routesData.map((r: any) => ({
      route_id: String(r.route_id),
      route_short_name: r.route_short_name || r.route_id,
      route_long_name: r.route_long_name || '',
      route_type: r.route_type ? Number(r.route_type) : 3,
      route_color: r.route_color || undefined,
      route_text_color: r.route_text_color || undefined,
    }));
  }
}

export const gtfsService = new GtfsService();
