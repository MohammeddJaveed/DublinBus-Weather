export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface BusMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  route: string;
  delay?: number;
}

class MapService {
  
  calculateRegion(
    userLocation: { latitude: number; longitude: number },
    destination?: { latitude: number; longitude: number }
  ): MapRegion {
    if (!destination) {
     
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }

    
    const minLat = Math.min(userLocation.latitude, destination.latitude);
    const maxLat = Math.max(userLocation.latitude, destination.latitude);
    const minLng = Math.min(userLocation.longitude, destination.longitude);
    const maxLng = Math.max(userLocation.longitude, destination.longitude);

    const latitudeDelta = (maxLat - minLat) * 1.5; 
    const longitudeDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latitudeDelta, 0.01), 
      longitudeDelta: Math.max(longitudeDelta, 0.01),
    };
  }

  
  generateMockBusMarkers(userLocation: { latitude: number; longitude: number }): BusMarker[] {
   
    const busRoutes = ['46A', '145', '39A', '16', '27', '7', '14', '15'];
    
    return busRoutes.map((route, index) => {
     
      const angle = (index / busRoutes.length) * 2 * Math.PI;
      const distance = 0.005 + (Math.random() * 0.01); 
      
      const latOffset = Math.cos(angle) * distance;
      const lngOffset = Math.sin(angle) * distance;
      
      return {
        id: `bus-${index}`,
        latitude: userLocation.latitude + latOffset,
        longitude: userLocation.longitude + lngOffset,
        title: `Bus ${route}`,
        description: `Route ${route} to City Centre`,
        route: route,
        delay: Math.random() > 0.7 ? Math.floor(Math.random() * 600) : 0, 
      };
    });
  }

  
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
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

export const mapService = new MapService();