import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { locationService } from '../services/LocationService';
import WeatherService from '../services/WeatherService';
import { eircodeService } from '../services/EirCodeService';
import { transportService } from '../services/TransportService';
import { busStopService, BusStop } from '../services/BusStopService';
import { WeatherData, LocationData } from '../types/api';

interface TransportData {
  id: string;
  route: string;
  destination: string;
  delay: number;
  eta: string;
  stops: number;
}

const COLORS = {
  primary: '#00A65A',
  secondary: '#3498DB',
  background: '#F8F9FA',
  text: '#2C3E50',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  lightGray: '#ECF0F1',
  darkGray: '#7F8C8D',
  white: '#FFFFFF',
};

const STYLES = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 4, md: 8, lg: 12 },
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [eircode, setEircode] = useState('');
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationName, setLocationName] = useState('');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null,
  );
  const [nearbyBuses, setNearbyBuses] = useState<TransportData[]>([]);
  const [nearbyBusStops, setNearbyBusStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [apiStatus, setApiStatus] = useState('');

  const weatherServiceRef = useRef(new WeatherService());

  useEffect(() => {
    initializeApp();
    setApiStatus(transportService.getApiStatus().message);
  }, []);

  const initializeApp = async () => {
    setLocationLoading(true);
    try {
      await getCurrentLocation();
    } finally {
      setLocationLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await locationService.requestLocationPermission();
      const location: LocationData = hasPermission
        ? await locationService.getCurrentLocation()
        : locationService.getDefaultLocation();

      setUserLocation(location);
      await fetchLocationName(location);
      await fetchCurrentWeather(location);
      await fetchNearbyTransport(location);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError(
        'Failed to get location. Using default location (Dublin).',
      );
      const defaultLocation = locationService.getDefaultLocation();
      setUserLocation(defaultLocation);
      await fetchLocationName(defaultLocation);
      await fetchCurrentWeather(defaultLocation);
      await fetchNearbyTransport(defaultLocation);
    }
  };

  const fetchLocationName = async (location: LocationData) => {
    try {
      const name = await weatherServiceRef.current.getLocationName(
        location.latitude,
        location.longitude,
      );
      setLocationName(name);
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocationName(
        weatherServiceRef.current.getDublinAreaName(
          location.latitude,
          location.longitude,
        ),
      );
    }
  };

  const fetchCurrentWeather = async (location: LocationData) => {
    try {
      const weather = await weatherServiceRef.current.getCurrentWeather(
        location.latitude,
        location.longitude,
      );
      setCurrentWeather(weather);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setCurrentWeather(
        weatherServiceRef.current.getMockWeatherData(
          location.latitude,
          location.longitude,
        ),
      );
    }
  };

  const fetchNearbyTransport = async (location: LocationData) => {
    try {
      const buses = await transportService.getBusesNearLocation(
        location.latitude,
        location.longitude,
        5, // 5 km radius
      );

      const formattedBuses = buses.map(bus => ({
        id: bus.id,
        route: bus.route,
        destination: bus.destination,
        delay: bus.delay,
        eta: 'N/A',
        stops: 0,
      }));

      setNearbyBuses(formattedBuses);

      // Fetch nearby bus stops (Haversine)
      const stops = await busStopService.loadBusStopsData();
      const nearbyStops = stops.filter(stop => {
        const R = 6371;
        const dLat = ((stop.stop_lat - location.latitude) * Math.PI) / 180;
        const dLon = ((stop.stop_lon - location.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((location.latitude * Math.PI) / 180) *
            Math.cos((stop.stop_lat * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance <= 3;
      });
      setNearbyBusStops(nearbyStops);
    } catch (error) {
      console.error('Error fetching transport data:', error);
    }
  };

  const handleSearch = async () => {
    if (!eircode.trim()) {
      Alert.alert('Error', 'Please enter an Eircode or address');
      return;
    }
    setLoading(true);
    try {
      let destinationCoords: { latitude: number; longitude: number };
      let destinationName: string;

      if (eircodeService.isValidEircode(eircode)) {
        const eircodeResult = await eircodeService.lookupEircode(eircode);
        if (!eircodeResult) throw new Error('Eircode not found');
        destinationCoords = {
          latitude: eircodeResult.latitude,
          longitude: eircodeResult.longitude,
        };
        destinationName = eircodeResult.address;
      } else {
        const addressResult = await eircodeService.searchAddress(eircode);
        if (!addressResult) throw new Error('Address not found');
        destinationCoords = {
          latitude: addressResult.latitude,
          longitude: addressResult.longitude,
        };
        destinationName = addressResult.address;
      }

      const userCoords = userLocation || locationService.getDefaultLocation();
      const distance = eircodeService.calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        destinationCoords.latitude,
        destinationCoords.longitude,
      );

      navigation.navigate('SearchResults', {
        eircode: eircodeService.formatEircode(eircode),
        userLocation: userCoords,
        destination: destinationCoords,
        destinationName,
        distance,
      });
    } catch (error: any) {
      Alert.alert('Search Error', error.message || 'Failed to search.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLocation = async () => {
    setLocationLoading(true);
    setLocationError('');
    setLocationName('');
    await getCurrentLocation();
    setLocationLoading(false);
  };

  const handlePlanJourney = () => navigation.navigate('JourneyPlanner');

  const handleLiveMap = () => {
    if (!userLocation) return;
    const sampleDestination = { latitude: 53.3494, longitude: -6.2602 };
    navigation.navigate('LiveMap', {
      busData: nearbyBuses,
      destination: sampleDestination,
    });
  };

  const getTrafficLevel = (delay: number) => {
    if (delay < 300)
      return { level: 'light', color: COLORS.success, label: 'Light traffic' };
    if (delay < 900)
      return {
        level: 'moderate',
        color: COLORS.warning,
        label: 'Moderate traffic',
      };
    return { level: 'heavy', color: COLORS.danger, label: 'Heavy traffic' };
  };

  const formatDelay = (delay: number) => `${Math.floor(delay / 60)} min late`;

  const getSearchPlaceholder = () =>
    'Enter Eircode (e.g., D01F5P2) or Dublin address';

  // --- Keep the same JSX below (unchanged from your previous HomeScreen) ---
  // (Weather, Nearby buses, Quick Actions, Features Overview, etc.)
  // ... use your previous code for rendering

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dublin Bus & Weather</Text>
        <Text style={styles.headerSubtitle}>Real-time travel information</Text>

        {/* Location Status */}
        <View style={styles.locationStatus}>
          {locationLoading ? (
            <Text style={styles.locationText}>📍 Getting your location...</Text>
          ) : locationError ? (
            <View style={styles.locationError}>
              <Text style={styles.locationErrorText}>{locationError}</Text>
              <TouchableOpacity onPress={handleRefreshLocation}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : locationName ? (
            <View style={styles.locationSuccess}>
              <Text style={styles.locationText}>📍 {locationName}</Text>
              <TouchableOpacity onPress={handleRefreshLocation}>
                <Text style={styles.retryText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.locationText}>📍 Unknown Location</Text>
          )}
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder={getSearchPlaceholder()}
          value={eircode}
          onChangeText={setEircode}
          placeholderTextColor={COLORS.darkGray}
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.disabledButton]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Weather */}
      {currentWeather && (
        <View style={styles.weatherCard}>
          <Text style={styles.sectionTitle}>
            Current Weather {locationName && `in ${locationName}`}
          </Text>
          <View style={styles.weatherContent}>
            <Text style={styles.temperature}>
              {Math.round(currentWeather.main.temp)}°C
            </Text>
            <View style={styles.weatherDetails}>
              <Text style={styles.weatherDescription}>
                {currentWeather.weather[0]?.description}
              </Text>
              <Text style={styles.weatherInfo}>
                Feels like {Math.round(currentWeather.main.feels_like)}°C
              </Text>
              <Text style={styles.weatherInfo}>
                Humidity: {currentWeather.main.humidity}%
              </Text>
              <Text style={styles.weatherInfo}>
                Wind: {currentWeather.wind.speed.toFixed(1)} m/s
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Nearby Buses */}
      <View style={styles.busesSection}>
        <Text style={styles.sectionTitle}>
          Nearby Buses ({nearbyBuses.length})
        </Text>
        {nearbyBuses.length > 0 ? (
          nearbyBuses.slice(0, 4).map(bus => {
            const traffic = getTrafficLevel(bus.delay);
            return (
              <View key={bus.id} style={styles.busCard}>
                <View style={styles.busHeader}>
                  <Text style={styles.busNumber}>Bus {bus.route}</Text>
                  <Text style={styles.busDelay}>
                    {formatDelay(bus.delay) > 1
                      ? formatDelay(bus.delay)
                      : 'On time'}
                  </Text>
                </View>
                <Text style={styles.busInfo}>To: {bus.destination}</Text>
                <Text style={styles.busInfo}>
                  ETA: {bus.eta} • {bus.stops} stops
                </Text>
                <View style={styles.busDetails}>
                  <View
                    style={[
                      styles.trafficIndicator,
                      { backgroundColor: traffic.color },
                    ]}
                  >
                    <Text style={styles.trafficText}>{traffic.label}</Text>
                  </View>
                  {bus.delay > 300 && (
                    <Text style={styles.delayWarning}>
                      ⚠️ {Math.floor(bus.delay / 60)} min delay
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.noBusesCard}>
            <Text style={styles.noBusesText}>No buses found nearby</Text>
            <Text style={styles.noBusesSubtext}>
              {userLocation
                ? 'Try refreshing or check back later'
                : 'Enable location services to see nearby buses'}
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePlanJourney}
        >
          <Text style={styles.actionButtonText}>Plan Journey</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleLiveMap}>
          <Text style={styles.actionButtonText}>Live Map</Text>
        </TouchableOpacity>
      </View>

      {/* Features Overview */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>App Features</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureText}>Location Name</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚌</Text>
            <Text style={styles.featureText}>Live Bus Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌤️</Text>
            <Text style={styles.featureText}>Weather Updates</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <Text style={styles.featureText}>Interactive Maps</Text>
          </View>
        </View>
        <View style={styles.apiStatus}>
          <Text style={styles.apiStatusText}>API Status: {apiStatus}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// ... (keep the existing styles from your previous code)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: STYLES.spacing.lg,
    paddingTop: STYLES.spacing.xl + 20,
  },
  apiStatus: {
    backgroundColor: COLORS.lightGray,
    padding: STYLES.spacing.sm,
    borderRadius: STYLES.borderRadius.sm,
    margin: STYLES.spacing.sm,
    alignItems: 'center',
  },
  apiStatusText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: STYLES.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: STYLES.spacing.sm,
  },
  locationStatus: {
    marginTop: STYLES.spacing.sm,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  locationError: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationErrorText: {
    fontSize: 14,
    color: COLORS.warning,
    flex: 1,
  },
  locationSuccess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  searchSection: {
    padding: STYLES.spacing.lg,
    backgroundColor: COLORS.white,
    margin: STYLES.spacing.md,
    borderRadius: STYLES.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: STYLES.borderRadius.md,
    padding: STYLES.spacing.md,
    fontSize: 16,
    marginBottom: STYLES.spacing.md,
    color: COLORS.text,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    padding: STYLES.spacing.md,
    borderRadius: STYLES.borderRadius.md,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.darkGray,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  weatherCard: {
    backgroundColor: COLORS.secondary,
    margin: STYLES.spacing.md,
    padding: STYLES.spacing.lg,
    borderRadius: STYLES.borderRadius.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: STYLES.spacing.md,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  weatherDetails: {
    flex: 1,
    marginLeft: STYLES.spacing.lg,
  },
  weatherDescription: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weatherInfo: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: STYLES.spacing.xs,
  },
  busesSection: {
    margin: STYLES.spacing.md,
  },
  busCard: {
    backgroundColor: COLORS.white,
    padding: STYLES.spacing.md,
    borderRadius: STYLES.borderRadius.md,
    marginBottom: STYLES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noBusesCard: {
    backgroundColor: COLORS.white,
    padding: STYLES.spacing.lg,
    borderRadius: STYLES.borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noBusesText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: STYLES.spacing.xs,
  },
  noBusesSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: STYLES.spacing.xs,
  },
  busNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  busDelay: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  busInfo: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: STYLES.spacing.sm,
  },
  busDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trafficIndicator: {
    paddingHorizontal: STYLES.spacing.sm,
    paddingVertical: STYLES.spacing.xs,
    borderRadius: STYLES.borderRadius.sm,
  },
  trafficText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  delayWarning: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
  },
  actionsSection: {
    flexDirection: 'row',
    margin: STYLES.spacing.md,
    gap: STYLES.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: STYLES.spacing.md,
    borderRadius: STYLES.borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresSection: {
    margin: STYLES.spacing.md,
    padding: STYLES.spacing.lg,
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: STYLES.spacing.md,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    padding: STYLES.spacing.md,
    marginBottom: STYLES.spacing.md,
    backgroundColor: COLORS.background,
    borderRadius: STYLES.borderRadius.md,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: STYLES.spacing.xs,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  moreBusesCard: {
    backgroundColor: COLORS.lightGray,
    padding: STYLES.spacing.md,
    borderRadius: STYLES.borderRadius.md,
    alignItems: 'center',
    marginTop: STYLES.spacing.sm,
  },
  moreBusesText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
