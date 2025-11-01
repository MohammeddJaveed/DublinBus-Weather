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
  delay: number;
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
  private lastFetchTime: number = 0;
  private cachedData: any[] = [];

  async getRealTimeData(): Promise<any[]> {
    const now = Date.now();

    // ✅ Use cached data if last fetch was within 30 seconds
    if (now - this.lastFetchTime < 300000 && this.cachedData.length > 0) {
      console.log(' Using cached NTI transport data');
      return this.cachedData;
    }

    try {
      const response = await axios.get(TRANSPORT_BASE_URL, {
        headers: {
          'x-api-key': TRANSPORT_API_KEY,
          'Cache-Control': 'no-cache',
        },
        timeout: 15000,
      });

      if (response.data?.entity && Array.isArray(response.data.entity)) {
        this.cachedData = response.data.entity;
        this.lastFetchTime = now;
        console.log(
          `✅ NTI API: ${
            this.cachedData.length
          } entities fetched at ${new Date().toISOString()}`,
        );
        return this.cachedData;
      }

      console.warn('⚠️ Unexpected NTI API response structure.');
      return this.cachedData;
    } catch (error: any) {
      const status = error.response?.status;
      console.error(`❌ NTI API Error (${status}):`, error.message);

      if (status === 429) {
        console.warn('⚠️ Rate limit hit. Retrying after 10 seconds...');
        await new Promise(res => setTimeout(res, 10000));
        return this.getRealTimeData();
      }

      if (this.cachedData.length > 0) {
        console.log('⚙️ Using cached data due to API error.');
        return this.cachedData;
      }

      return [];
    }
  }

  async getBusesToDestination(
    userLat: number,
    userLon: number,
    destLat: number,
    destLon: number,
  ): Promise<Bus[]> {
    const nearbyBuses = await this.getBusesNearLocation(userLat, userLon, 10);

    let stopsData: any[] = [];
    try {
      stopsData = (await import('../data/json/stops.json')).default;
    } catch (e) {
      console.warn('Stops data not found');
      return [];
    }

    const nearbyStops = stopsData.filter(stop => {
      const distance = this.calculateDistance(
        destLat,
        destLon,
        parseFloat(stop.stop_lat),
        parseFloat(stop.stop_lon),
      );
      return distance <= 1;
    });

    if (nearbyStops.length === 0) {
      console.log('No stops near destination');
      return [];
    }

    const nearbyStopIds = new Set(nearbyStops.map(s => s.stop_id));

    const filtered = nearbyBuses.filter(bus => {
      if (bus.stopId && nearbyStopIds.has(bus.stopId)) return true;

      if (bus.routeId) {
        const routeStops = stopsData.filter(s => s.route_id === bus.routeId);
        return routeStops.some(stop => nearbyStopIds.has(stop.stop_id));
      }

      const distance = this.calculateDistance(
        bus.latitude,
        bus.longitude,
        destLat,
        destLon,
      );
      return distance <= 2;
    });

    console.log(`Found ${filtered.length} buses going toward destination`);
    return filtered;
  }

  /**
   * Get buses near user's location
   */
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

      const trip = tripUpdate.trip || {};
      const vehicle = tripUpdate.vehicle || {};
      const stopTimes = tripUpdate.stop_time_update || [];

      // Match static route info
      const routeInfo = routes.find(r => r.route_id === trip.route_id);
      const routeShort = routeInfo?.route_short_name || 'Unknown';
      const routeLong = routeInfo?.route_long_name || 'Unknown';

      const position = vehicle.position || {};
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
        destination: routeLong,
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
    if (!TRANSPORT_API_KEY || TRANSPORT_API_KEY === '') {
      return { status: 'no_key', message: 'API key not configured.' };
    }
    return { status: 'active', message: 'Connected to NTI API' };
  }
}

export const transportService = new TransportService();
