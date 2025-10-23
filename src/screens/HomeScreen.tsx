import React, { useState, useEffect } from 'react';
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
import WeatherService from '../services/WeatherService';
import TransportService from '../services/TransportService';
import { WeatherData, TransportData, LocationData } from '../types/api';

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
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [eircode, setEircode] = useState<string>('');
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null,
  );
  const [nearbyBuses, setNearbyBuses] = useState<TransportData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setUserLocation({ latitude: 53.3498, longitude: -6.2603 }); // Dublin coordinates
    fetchCurrentWeather(53.3498, -6.2603);
    fetchNearbyBuses();
  }, []);

  const fetchCurrentWeather = async (lat: number, lon: number) => {
    try {
      const weather = await WeatherService.getCurrentWeather(lat, lon);
      setCurrentWeather(weather);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const fetchNearbyBuses = async () => {
    try {
      // For now, use mock data
      const buses = TransportService.getMockBusData();
      setNearbyBuses(buses);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const handleSearch = async () => {
    if (!eircode.trim()) {
      Alert.alert('Error', 'Please enter an Eircode');
      return;
    }

    setLoading(true);
    try {
      // Navigate to SearchResults screen with the eircode
      navigation.navigate('SearchResults', {
        eircode,
        userLocation: userLocation || { latitude: 53.3498, longitude: -6.2603 },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanJourney = () => {
    navigation.navigate('JourneyPlanner');
  };

  const handleLiveMap = () => {
    navigation.navigate('LiveMap', {
      busData: nearbyBuses,
      destination: { latitude: 53.3498, longitude: -6.2603 },
    });
  };

  const getTrafficLevel = (delay: number) => {
    if (delay < 300) {
      return { level: 'light', color: COLORS.success, label: 'Light traffic' };
    } else if (delay < 900) {
      return {
        level: 'moderate',
        color: COLORS.warning,
        label: 'Moderate traffic',
      };
    } else {
      return { level: 'heavy', color: COLORS.danger, label: 'Heavy traffic' };
    }
  };

  const formatDelay = (delay: number): string => {
    const minutes = Math.floor(delay / 60);
    return minutes > 0 ? `${minutes} min late` : 'On time';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dublin Bus & Weather</Text>
        <Text style={styles.headerSubtitle}>Real-time travel information</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Eircode or address..."
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
          <Text style={styles.sectionTitle}>Current Weather</Text>
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
                Wind: {currentWeather.wind.speed} m/s
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Nearby Buses */}
      <View style={styles.busesSection}>
        <Text style={styles.sectionTitle}>Nearby Buses</Text>
        {nearbyBuses.map(bus => {
          const delay =
            bus.trip_update?.stop_time_update[0]?.arrival.delay || 0;
          const traffic = getTrafficLevel(delay);

          return (
            <View key={bus.id} style={styles.busCard}>
              <View style={styles.busHeader}>
                <Text style={styles.busNumber}>
                  Bus {bus.trip_update?.trip.route_id}
                </Text>
                <Text style={styles.busDelay}>{formatDelay(delay)}</Text>
              </View>
              <Text style={styles.busInfo}>
                Vehicle: {bus.trip_update?.vehicle.id}
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
                {delay > 300 && (
                  <Text style={styles.delayWarning}>⚠️ Delayed</Text>
                )}
              </View>
            </View>
          );
        })}
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
            <Text style={styles.featureIcon}>🚌</Text>
            <Text style={styles.featureText}>Real-time Bus Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌤️</Text>
            <Text style={styles.featureText}>Live Weather Updates</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <Text style={styles.featureText}>Interactive Maps</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⏱️</Text>
            <Text style={styles.featureText}>Journey Planning</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

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
});

export default HomeScreen;
