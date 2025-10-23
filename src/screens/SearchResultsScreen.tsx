import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

// Define colors and styles
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

type SearchResultsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SearchResults'
>;

type SearchResultsScreenRouteProp = RouteProp<
  RootStackParamList,
  'SearchResults'
>;

interface Props {
  navigation: SearchResultsScreenNavigationProp;
  route: SearchResultsScreenRouteProp;
}

const SearchResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { eircode, userLocation } = route.params;
  const [loading, setLoading] = useState(true);
  const [busData, setBusData] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadSearchResults();
  }, []);

  const loadSearchResults = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock data for demonstration
      setBusData([
        {
          id: '1',
          route: '6A',
          destination: 'Dun Laoghaire',
          eta: '8 min',
          stops: 12,
          duration: '25 min',
          traffic: 'moderate',
          delay: 4788,
        },
        {
          id: '2',
          route: '145',
          destination: 'Heuston Station',
          eta: '12 min',
          stops: 8,
          duration: '18 min',
          traffic: 'light',
          delay: 120,
        },
      ]);

      setWeatherData({
        current: { temp: 15, condition: 'Partly Cloudy', icon: '☀️' },
        forecast: { temp: 14, condition: 'Cloudy', icon: '☁️' },
      });

      setDestinationCoords({ latitude: 53.346, longitude: -6.259 });

      setLoading(false);
    } catch (error) {
      console.error('Error loading search results:', error);
      setLoading(false);
    }
  };

  const handleShowOnMap = () => {
    if (destinationCoords) {
      navigation.navigate('LiveMap', {
        busData,
        destination: destinationCoords,
      });
    }
  };

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case 'light':
        return COLORS.success;
      case 'moderate':
        return COLORS.warning;
      case 'heavy':
        return COLORS.danger;
      default:
        return COLORS.darkGray;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding best routes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Results for: {eircode}</Text>
        <Text style={styles.headerSubtitle}>
          From: Your Location (
          {userLocation ? '2.1km away' : 'Unknown distance'})
        </Text>
        <Text style={styles.headerSubtitle}>
          To: O'Connell Street, Dublin 1
        </Text>
      </View>

      {/* Weather Forecast */}
      {weatherData && (
        <View style={styles.weatherCard}>
          <Text style={styles.sectionTitle}>Weather Forecast</Text>
          <View style={styles.weatherRow}>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherIcon}>{weatherData.current.icon}</Text>
              <Text style={styles.weatherText}>
                Now: {weatherData.current.temp}°C
              </Text>
              <Text style={styles.weatherSubtext}>
                {weatherData.current.condition}
              </Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherIcon}>
                {weatherData.forecast.icon}
              </Text>
              <Text style={styles.weatherText}>
                Arrival: {weatherData.forecast.temp}°C
              </Text>
              <Text style={styles.weatherSubtext}>
                {weatherData.forecast.condition}
              </Text>
            </View>
          </View>
          <Text style={styles.weatherSummary}>
            No rain expected during your journey
          </Text>
        </View>
      )}

      {/* Available Buses */}
      <View style={styles.busesSection}>
        <Text style={styles.sectionTitle}>Available Buses</Text>
        {busData.map(bus => (
          <View key={bus.id} style={styles.busCard}>
            <View style={styles.busHeader}>
              <Text style={styles.busRoute}>Bus {bus.route}</Text>
              <Text style={styles.busETA}>ETA: {bus.eta}</Text>
            </View>
            <Text style={styles.busDestination}>To: {bus.destination}</Text>
            <View style={styles.busDetails}>
              <Text style={styles.busDetail}>🕒 {bus.duration}</Text>
              <Text style={styles.busDetail}>🚏 {bus.stops} stops</Text>
              <View
                style={[
                  styles.trafficIndicator,
                  { backgroundColor: getTrafficColor(bus.traffic) },
                ]}
              >
                <Text style={styles.trafficText}>{bus.traffic} traffic</Text>
              </View>
            </View>
            {bus.delay > 300 && (
              <Text style={styles.delayText}>
                ⚠️ Running {Math.floor(bus.delay / 60)} minutes late
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.mapButton} onPress={handleShowOnMap}>
          <Text style={styles.mapButtonText}>Show on Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.planButton}
          onPress={() => navigation.navigate('JourneyPlanner')}
        >
          <Text style={styles.planButtonText}>Plan Return Trip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: STYLES.spacing.md,
    fontSize: 16,
    color: COLORS.text,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    margin: STYLES.spacing.md,
    padding: STYLES.spacing.lg,
    borderRadius: STYLES.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: STYLES.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: STYLES.spacing.xs,
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
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherItem: {
    alignItems: 'center',
    flex: 1,
  },
  weatherIcon: {
    fontSize: 24,
    marginBottom: STYLES.spacing.xs,
  },
  weatherText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  weatherSubtext: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  weatherSummary: {
    marginTop: STYLES.spacing.md,
    fontSize: 14,
    color: COLORS.white,
    fontStyle: 'italic',
  },
  busesSection: {
    margin: STYLES.spacing.md,
  },
  busCard: {
    backgroundColor: COLORS.white,
    padding: STYLES.spacing.lg,
    borderRadius: STYLES.borderRadius.md,
    marginBottom: STYLES.spacing.md,
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
  busRoute: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  busETA: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
  },
  busDestination: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: STYLES.spacing.sm,
  },
  busDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busDetail: {
    fontSize: 12,
    color: COLORS.darkGray,
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
  delayText: {
    marginTop: STYLES.spacing.sm,
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
  },
  actionsSection: {
    flexDirection: 'row',
    margin: STYLES.spacing.md,
    gap: STYLES.spacing.md,
  },
  mapButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: STYLES.spacing.md,
    borderRadius: STYLES.borderRadius.md,
    alignItems: 'center',
  },
  mapButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  planButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: STYLES.spacing.md,
    borderRadius: STYLES.borderRadius.md,
    alignItems: 'center',
  },
  planButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchResultsScreen;
