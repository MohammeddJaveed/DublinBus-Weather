import axios from 'axios';
import { TransportData } from '../types/api';

// Define API keys directly here
const TRANSPORT_API_KEY = '';
const TRANSPORT_BASE_URL = 'https://api.nationaltransport.ie/gtfsr/v2';

const TransportService = {
  async getRealTimeData(): Promise<TransportData[]> {
    try {
      const response = await axios.get(
        `${TRANSPORT_BASE_URL}/gtfsr?format=json`,
        {
          headers: {
            'x-api-key': TRANSPORT_API_KEY,
            'Cache-Control': 'no-cache',
          },
        },
      );
      return response.data.entity || [];
    } catch (error) {
      console.error('Transport API Error:', error);
      throw error;
    }
  },

  getMockBusData(): TransportData[] {
    return [
      {
        id: '1',
        trip_update: {
          trip: {
            trip_id: '4969_69897',
            route_id: '46A',
            direction_id: 0,
          },
          stop_time_update: [
            {
              arrival: { delay: 4788 },
              stop_id: '8460B5550401',
            },
          ],
          vehicle: { id: '7096' },
        },
      },
      {
        id: '2',
        trip_update: {
          trip: {
            trip_id: '4969_70101',
            route_id: '145',
            direction_id: 1,
          },
          stop_time_update: [
            {
              arrival: { delay: 120 },
              stop_id: '8460B5550402',
            },
          ],
          vehicle: { id: '7097' },
        },
      },
    ];
  },
};

export default TransportService;
