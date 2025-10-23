import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { transportService } from '../services/TransportService';
import { locationService } from '../services/LocationService';

import routesData from '../data/json/routes.json';

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
  const [loading, setLoading] = useState(true);
  const [busData, setBusData] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 53.3498,
    longitude: -6.2603,
  });

  const searchTerm = route.params?.searchTerm?.toLowerCase() || '';

  useEffect(() => {
    loadNearbyBuses();
  }, []);

  const loadNearbyBuses = async () => {
    try {
      setLoading(true);

      let location;
      try {
        const permission = await locationService.requestLocationPermission();
        if (permission) {
          location = await locationService.getCurrentLocation();
        } else {
          location = locationService.getDefaultLocation();
        }
      } catch (err) {
        console.warn('⚠️ Failed to get user location, using default', err);
        location = locationService.getDefaultLocation();
      }

      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      const nearbyBuses = await transportService.getBusesNearLocation(
        location.latitude,
        location.longitude,
        10, // 10 km radius
      );

      if (!nearbyBuses || nearbyBuses.length === 0) {
        setBusData([]);
        setLoading(false);
        return;
      }

      const mappedBuses = nearbyBuses.map((bus, index) => {
        const routeMatch = routesData.find(
          (r: any) => r.route_id === bus.routeId,
        );
        const routeShort = routeMatch?.route_short_name || bus.route || 'N/A';
        const routeLong = routeMatch?.route_long_name || 'Unknown Route';

        return {
          id: bus.id || `bus-${index}`,
          routeShort,
          routeLong,
          start: 'Unknown',
          destination: bus.destination || routeLong,
          eta: bus.eta || '5 min',
          delay: bus.delay || 0,
          traffic:
            bus.delay > 300 ? 'heavy' : bus.delay > 180 ? 'moderate' : 'light',
          latitude: bus.latitude,
          longitude: bus.longitude,
          distanceFromUser: bus.distance || 0,
        };
      });

      const filteredBuses = searchTerm
        ? mappedBuses.filter(
            bus =>
              bus.routeShort.toLowerCase().includes(searchTerm) ||
              bus.routeLong.toLowerCase().includes(searchTerm),
          )
        : mappedBuses.filter(bus => bus.distanceFromUser <= 10);

      mappedBuses.sort((a, b) => a.distanceFromUser - b.distanceFromUser);
      setBusData(mappedBuses);
    } catch (err) {
      console.error('Error fetching nearby buses:', err);
      Alert.alert('Error', 'Failed to load bus data.');
      setBusData([]);
    } finally {
      setLoading(false);
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

  const handleRefresh = () => {
    loadNearbyBuses();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading buses near you...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {busData.length > 0 ? (
        busData.map(bus => (
          <TouchableOpacity
            key={bus.id}
            style={styles.busCard}
            onPress={() =>
              navigation.navigate('Map', {
                selectedBus: bus,
                userLocation: userLocation,
              })
            }
          >
            <Text style={styles.busRoute}>
              🚌 {bus.routeShort} — {bus.routeLong}
            </Text>
            <Text style={styles.busDest}>To: {bus.destination}</Text>
            <Text style={styles.busDetail}>ETA: {bus.eta}</Text>
            <Text
              style={[
                styles.busDetail,
                { color: getTrafficColor(bus.traffic) },
              ]}
            >
              Traffic: {bus.traffic}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noBusesCard}>
          <Text style={styles.noBusesText}>No buses found nearby</Text>
          <Text style={styles.noBusesSubtext}>
            Try refreshing or check again later
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: STYLES.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: STYLES.spacing.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  busCard: {
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.md,
    padding: STYLES.spacing.md,
    marginBottom: STYLES.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  busRoute: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  busDest: { fontSize: 14, color: COLORS.text, marginVertical: 2 },
  busDetail: { fontSize: 12, color: COLORS.darkGray },
  noBusesCard: {
    backgroundColor: COLORS.white,
    padding: STYLES.spacing.lg,
    borderRadius: STYLES.borderRadius.md,
    alignItems: 'center',
  },
  noBusesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  noBusesSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: STYLES.spacing.sm,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: STYLES.spacing.lg,
    paddingVertical: STYLES.spacing.sm,
    borderRadius: STYLES.borderRadius.md,
  },
  refreshButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
});

export default SearchResultsScreen;
