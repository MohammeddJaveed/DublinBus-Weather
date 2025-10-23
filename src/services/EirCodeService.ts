// Service for converting Irish Eircodes to coordinates

export interface EircodeResult {
  eircode: string;
  latitude: number;
  longitude: number;
  address: string;
  townland: string;
  street: string;
  posttown: string;
  county: string;
}

class EircodeService {
  
 
  
  isValidEircode(eircode: string): boolean {
    const eircodeRegex = /^[AC-FHKNPRTV-Y][0-9][0-9W]?[0-9AC-FHKNPRTV-Y]{4}$/;
    return eircodeRegex.test(eircode.toUpperCase().replace(/\s+/g, ''));
  }

 
  formatEircode(eircode: string): string {
    const cleanEircode = eircode.toUpperCase().replace(/\s+/g, '');
    if (cleanEircode.length === 7) {
      return `${cleanEircode.slice(0, 3)} ${cleanEircode.slice(3)}`;
    }
    return cleanEircode;
  }

 
  async lookupEircode(eircode: string): Promise<EircodeResult | null> {
    try {
      const cleanEircode = eircode.toUpperCase().replace(/\s+/g, '');

     
      if (!this.isValidEircode(cleanEircode)) {
        throw new Error('Invalid Eircode format');
      }

     
      const result = this.eircodeDatabase[cleanEircode];

      if (result) {
        return result;
      }

      
      return await this.fallbackGeocode(cleanEircode);
    } catch (error) {
      console.error('Eircode lookup error:', error);
      throw new Error(`Could not find coordinates for Eircode: ${eircode}`);
    }
  }

  // Fallback geocoding using OpenStreetMap (for Eircodes not in our database)
  private async fallbackGeocode(eircode: string): Promise<EircodeResult> {
    try {
      // Use OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          eircode + ', Ireland',
        )}&limit=1`,
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          eircode: eircode,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name,
          townland: '',
          street: '',
          posttown: '',
          county: 'Dublin',
        };
      }

      throw new Error('No results found from geocoding service');
    } catch (error) {
      console.error('Fallback geocoding error:', error);

    
      return {
        eircode: eircode,
        latitude: 53.3498,
        longitude: -6.2603,
        address: 'Dublin City Centre (Approximate)',
        townland: 'Dublin 1',
        street: '',
        posttown: 'Dublin',
        county: 'Dublin',
      };
    }
  }

  
  async searchAddress(query: string): Promise<EircodeResult | null> {
    try {
      // For Dublin-specific addresses, check our database first
      const dublinLocations = [
        // "O'Connell Street",
        // 'Grafton Street',
        // "St. Stephen's Green",
        // 'Temple Bar',
        // 'Phoenix Park',
        // 'Docklands',
        // 'Ballsbridge',
        // 'Rathmines',
        // 'Ranelagh',
        // 'Donnybrook',
        // 'Sandycove',
        // 'Dún Laoghaire',
      ];

      const matchedLocation = dublinLocations.find(location =>
        query.toLowerCase().includes(location.toLowerCase()),
      );

      if (matchedLocation) {
        
        return {
          eircode: '',
          latitude: 53.3498,
          longitude: -6.2603,
          address: matchedLocation + ', Dublin',
          townland: '',
          street: '',
          posttown: 'Dublin',
          county: 'Dublin',
        };
      }

     
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ', Dublin, Ireland',
        )}&limit=1`,
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          eircode: '',
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name,
          townland: '',
          street: '',
          posttown: 'Dublin',
          county: 'Dublin',
        };
      }

      return null;
    } catch (error) {
      console.error('Address search error:', error);
      return null;
    }
  }

  
  calculateDistance(
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

export const eircodeService = new EircodeService();
