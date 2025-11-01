// src/screens/SearchResultsScreen.tsx

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
import { locationService } from '../services/LocationService';

const COLORS = {
  primary: '#00A65A',
  secondary: '#3498DB',
  background: '#F8F9FA',
  text: '#2C3E50',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  darkGray: '#7F8C8D',
  white: '#FFFFFF',
};

const STYLES = {
  spacing: { sm: 8, md: 16, lg: 24 },
  borderRadius: { md: 8 },
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
  const busesFromHome = route.params?.buses || [];
  const destinationCoords = route.params?.destination;
  const [loading, setLoading] = useState(true);
  const [busData, setBusData] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState({
    latitude: 53.3498,
    longitude: -6.2603,
  });

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);

      let location;
      try {
        const permission = await locationService.requestLocationPermission();
        location = permission
          ? await locationService.getCurrentLocation()
          : locationService.getDefaultLocation();
      } catch (err) {
        console.warn(' Location error, using default Dublin coords');
        location = locationService.getDefaultLocation();
      }
      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (busesFromHome && busesFromHome.length > 0) {
        setBusData(busesFromHome);
      } else {
        setBusData([]);
      }
    } catch (err) {
      console.error(' Error loading buses:', err);
      Alert.alert('Error', 'Failed to load bus data.');
      setBusData([]);
    } finally {
      setLoading(false);
    }
  };

  const getTrafficColor = (delay: number) => {
    if (delay < 300) return COLORS.success;
    if (delay < 900) return COLORS.warning;
    return COLORS.danger;
  };

  const formatDelay = (delay: number) =>
    delay > 0 ? `${Math.floor(delay / 60)} min late` : 'On time';

  const handleRefresh = () => loadBuses();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding buses...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {busData.length > 0 ? (
        busData.map(bus => (
          <TouchableOpacity
            key={bus.id}
            style={styles.busCard}
            onPress={() =>
              navigation.navigate('Map', {
                selectedBus: bus,
                userLocation,
              })
            }
          >
            <Text style={styles.busRoute}>
              🚌 {bus.route} — {bus.destination}
            </Text>
            <Text style={styles.busDest}>Destination: {bus.destination}</Text>
            <Text style={styles.busDetail}>ETA: {bus.eta || 'N/A'}</Text>
            <Text
              style={[styles.busDetail, { color: getTrafficColor(bus.delay) }]}
            >
              {formatDelay(bus.delay)}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noBusesCard}>
          <Text style={styles.noBusesText}>No buses found</Text>
          <Text style={styles.noBusesSubtext}>
            Try searching again or refreshing
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
  loadingText: { marginTop: 10, color: COLORS.text, fontSize: 16 },
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
  },
  noBusesSubtext: { fontSize: 14, color: COLORS.darkGray, marginBottom: 8 },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: STYLES.spacing.lg,
    paddingVertical: STYLES.spacing.sm,
    borderRadius: STYLES.borderRadius.md,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SearchResultsScreen;
