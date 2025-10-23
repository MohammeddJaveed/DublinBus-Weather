import axios from 'axios';
import routes from '../data/json/routes.json';

const TRANSPORT_API_KEY = '';
const TRANSPORT_BASE_URL =
  'https://api.nationaltransport.ie/gtfsr/v2/gtfsr?format=json';

export interface Bus {
  id: string;
  route: string;
  routeId?: string;
  vehicleId?: string;
  latitude: number;
  longitude: number;
  delay: number; // in seconds
  timestamp?: number;
  destination: string;
  bearing?: number;
  speed?: number;
  stopId?: string;
  stopSequence?: number;
  routeShortName?: string;
  routeLongName?: string;
}

class TransportService {
  // Fetch raw NTI data
  async getRealTimeData(): Promise<any[]> {
    try {
      const response = await axios.get(TRANSPORT_BASE_URL, {
        headers: {
          'x-api-key': TRANSPORT_API_KEY,
          'Cache-Control': 'no-cache',
        },
        timeout: 15000,
      });

      console.log(
        'NTI API Raw Response:',
        JSON.stringify(response.data, null, 2),
      );

      if (response.data.entity && Array.isArray(response.data.entity)) {
        return response.data.entity;
      }
      console.warn('⚠️ Unexpected API response structure.');
      return [];
    } catch (error: any) {
      console.error(' NTI API Error:', error.message);
      return [];
    }
  }

  async getBusesNearLocation(
    lat: number,
    lon: number,
    radiusKm: number = 20,
  ): Promise<Bus[]> {
    const realTimeData = await this.getRealTimeData();

    const buses: Bus[] = [];

    realTimeData.forEach((entity, index) => {
      const tripUpdate = entity.trip_update;
      if (!tripUpdate) return;

      const trip = tripUpdate.trip;
      const vehicle = tripUpdate.vehicle || {};
      const stopTimes = tripUpdate.stop_time_update || [];

      const routeInfo = routes.find(r => r.route_id === trip.route_id);
      const routeShort = routeInfo?.route_short_name || routeInfo;
      const routeLong = routeInfo?.route_long_name || 'Unknown';

      let position = vehicle.position || {};
      if (!position.latitude && stopTimes.length > 0) {
        position.latitude = 0;
        position.longitude = 0;
      }

      const delaySeconds = stopTimes[0]?.arrival?.delay ?? vehicle.delay ?? 0;

      buses.push({
        id: vehicle.id || `bus-${index}`,
        vehicleId: vehicle.id,
        route: routeShort,
        routeId: trip.route_id,
        latitude: position.latitude ?? lat,
        longitude: position.longitude ?? lon,
        delay: delaySeconds,
        timestamp: vehicle.timestamp ?? tripUpdate.timestamp,
        destination: routeLong, // ✅ use long name for destination
        bearing: position.bearing ?? 0,
        speed: position.speed ?? 0,
        stopId: stopTimes[0]?.stop_id,
        stopSequence: stopTimes[0]?.stop_sequence,
        routeShortName: routeShort,
        routeLongName: routeLong,
      });
    });

    // Filter by distance
    const nearbyBuses = buses.filter(bus => {
      const distance = this.calculateDistance(
        lat,
        lon,
        bus.latitude,
        bus.longitude,
      );
      return distance <= radiusKm;
    });

    console.log(`🚌 Found ${nearbyBuses.length} buses within ${radiusKm} km`);
    return nearbyBuses;
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  getApiStatus(): { status: string; message: string } {
    if (
      !TRANSPORT_API_KEY ||
      TRANSPORT_API_KEY === 'YOUR_ACTUAL_NTI_API_KEY_HERE'
    ) {
      return { status: 'no_key', message: 'API key not configured.' };
    }
    return { status: 'active', message: 'Connected to NTI API' };
  }
}

export const transportService = new TransportService();
