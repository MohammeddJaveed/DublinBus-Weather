import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  Region,
} from 'react-native-maps';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { busStopService, BusStop } from '../services/BusStopService';
import { mapService } from '../services/MapService';
import { gtfsService } from '../services/GtfsServices';
import { locationService, LocationData } from '../services/LocationService';

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
  busStop: '#9B59B6',
  user: '#E74C3C',
};

const STYLES = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 4, md: 8, lg: 12 },
};

const { width, height } = Dimensions.get('window');

const DEFAULT_REGION: Region = {
  latitude: 53.3498,
  longitude: -6.2603,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type LiveMapScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LiveMap'
>;
type LiveMapScreenRouteProp = RouteProp<RootStackParamList, 'LiveMap'>;

interface Props {
  navigation: LiveMapScreenNavigationProp;
  route: LiveMapScreenRouteProp;
}

const LiveMapScreen: React.FC<Props> = ({ route }) => {
  const { destination } = route.params;
  const mapRef = useRef<MapView>(null);

  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [selectedBusStop, setSelectedBusStop] = useState<BusStop | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [loadingStops, setLoadingStops] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showBusStops, setShowBusStops] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>(
    'standard',
  );

  const mapProvider =
    Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

  useEffect(() => {
    initLocationAndMap();
  }, []);

  useEffect(() => {
    if (userLocation && showBusStops) loadNearbyBusStops();
  }, [userLocation, mapRegion, showBusStops]);

  const initLocationAndMap = async () => {
    const granted = await locationService.requestLocationPermission();
    if (!granted) {
      Alert.alert(
        'Location Permission',
        'Cannot access your location. Using default location.',
      );
      setUserLocation(locationService.getDefaultLocation());
      return;
    }

    const location = await locationService.getCurrentLocation();
    setUserLocation(location);

    const region = destination
      ? mapService.calculateRegion(location, destination)
      : {
          ...location,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
    setMapRegion(region);
    setMapLoaded(true);

    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const loadNearbyBusStops = async () => {
    if (!userLocation || !showBusStops) {
      setBusStops([]);
      return;
    }

    try {
      setLoadingStops(true);
      const allStops = await busStopService.loadBusStopsData();
      const nearbyStops = allStops.filter(stop => {
        const distance = mapService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          stop.stop_lat,
          stop.stop_lon,
        );
        return distance <= 2000; // 2 km radius
      });
      setBusStops(nearbyStops);
    } catch (error) {
      console.error('Error loading bus stops:', error);
      setBusStops([]);
    } finally {
      setLoadingStops(false);
    }
  };

  const handleBusStopPress = (stop: BusStop) => {
    setSelectedBusStop(stop);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: stop.stop_lat,
          longitude: stop.stop_lon,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000,
      );
    }
  };

  const toggleMapType = () => {
    const types: Array<'standard' | 'satellite' | 'hybrid'> = [
      'standard',
      'satellite',
      'hybrid',
    ];
    setMapType(types[(types.indexOf(mapType) + 1) % types.length]);
  };

  const toggleBusStops = () => setShowBusStops(!showBusStops);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={mapProvider}
        region={mapRegion}
        mapType={mapType}
        showsUserLocation={false} // custom marker
        showsMyLocationButton={false}
        onRegionChangeComplete={region => setMapRegion(region)}
      >
        {/* User Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="You are here"
          >
            <View style={styles.userMarker}>
              <Text style={styles.userMarkerText}>📍</Text>
            </View>
          </Marker>
        )}

        {showBusStops &&
          busStops.map(stop => (
            <Marker
              key={stop.stop_id}
              coordinate={{ latitude: stop.stop_lat, longitude: stop.stop_lon }}
              title={stop.stop_name}
              description={`Bus Stop ${stop.stop_code}`}
              onPress={() => handleBusStopPress(stop)}
            >
              <View
                style={[
                  styles.busStopMarker,
                  selectedBusStop?.stop_id === stop.stop_id &&
                    styles.selectedBusStopMarker,
                ]}
              >
                <Text style={styles.busStopText}>🚏</Text>
              </View>
            </Marker>
          ))}
      </MapView>
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text>Loading Map...</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
          <Text style={styles.controlButtonText}>🗺️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            showBusStops && styles.activeControlButton,
          ]}
          onPress={toggleBusStops}
        >
          <Text style={styles.controlButtonText}>🚏</Text>
        </TouchableOpacity>
      </View>

      {selectedBusStop && (
        <View style={styles.infoPanel}>
          <View style={styles.infoHeader}>
            <Text style={styles.panelTitle}>{selectedBusStop.stop_name}</Text>
            <TouchableOpacity onPress={() => setSelectedBusStop(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text>Bus Stop {selectedBusStop.stop_code}</Text>
          <Text>
            Location: {selectedBusStop.stop_lat.toFixed(6)},{' '}
            {selectedBusStop.stop_lon.toFixed(6)}
          </Text>

          <Text style={{ marginTop: 8, fontWeight: 'bold' }}>Routes:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {gtfsService
              .loadRoutes()
              .filter(route =>
                route.stop_ids?.includes(selectedBusStop.stop_id),
              )
              .map(route => (
                <View key={route.route_id} style={styles.routeBadge}>
                  <Text style={styles.routeText}>{route.route_short_name}</Text>
                </View>
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { width: '100%', height: '100%' },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  controlsContainer: {
    position: 'absolute',
    top: STYLES.spacing.xl + 40,
    right: STYLES.spacing.md,
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.lg,
    padding: STYLES.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  controlButton: {
    padding: STYLES.spacing.sm,
    marginVertical: STYLES.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    borderRadius: STYLES.borderRadius.md,
  },
  activeControlButton: { backgroundColor: COLORS.primary },
  controlButtonText: { fontSize: 20 },
  busStopMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.busStop,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  selectedBusStopMarker: { backgroundColor: COLORS.primary },
  busStopText: { fontSize: 14 },
  userMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.user,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userMarkerText: { fontSize: 16 },
  infoPanel: {
    position: 'absolute',
    bottom: STYLES.spacing.md,
    left: STYLES.spacing.md,
    right: STYLES.spacing.md,
    backgroundColor: COLORS.white,
    borderRadius: STYLES.borderRadius.lg,
    padding: STYLES.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: STYLES.spacing.md,
  },
  panelTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  closeButton: { fontSize: 20, color: COLORS.darkGray },
  routeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: STYLES.spacing.sm,
    paddingVertical: STYLES.spacing.xs,
    borderRadius: STYLES.borderRadius.sm,
    marginRight: STYLES.spacing.xs,
  },
  routeText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
});

export default LiveMapScreen;
