export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

class LocationService {
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise(resolve => {
      
      console.log('📍 Using default Dublin location for demo');
      resolve({
        latitude: 53.3498,
        longitude: -6.2603,
        accuracy: 10,
      });
    });
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
     
      console.log('📍 Location permission granted for demo');
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  getDefaultLocation(): LocationData {
    return {
      latitude: 53.3498,
      longitude: -6.2603,
    };
  }
}

export const locationService = new LocationService();
