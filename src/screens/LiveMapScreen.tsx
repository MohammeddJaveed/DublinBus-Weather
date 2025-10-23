import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

const COLORS = {
  primary: '#00A65A',
  secondary: '#3498DB',
  background: '#F8F9FA',
  text: '#2C3E50',
  white: '#FFFFFF',
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
  const { busData, destination } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Live Map View</Text>
        <Text style={styles.subText}>
          This will show an interactive map with:
        </Text>
        <Text style={styles.featureText}>• Your current location</Text>
        <Text style={styles.featureText}>• Bus locations in real-time</Text>
        <Text style={styles.featureText}>• Bus routes and stops</Text>
        <Text style={styles.featureText}>• Destination marker</Text>
        <Text style={styles.subText}>
          Integration with react-native-maps coming soon!
        </Text>
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>Bus Information</Text>
        {busData &&
          busData.slice(0, 3).map((bus: any) => (
            <View key={bus.id} style={styles.busInfo}>
              <Text style={styles.busText}>
                Bus {bus.trip_update?.trip.route_id} -{' '}
                {bus.trip_update?.vehicle.id}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  subText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
  },
  infoPanel: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  busInfo: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  busText: {
    fontSize: 14,
    color: COLORS.text,
  },
});

export default LiveMapScreen;
