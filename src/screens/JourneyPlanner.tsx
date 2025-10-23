import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

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

type JourneyPlannerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'JourneyPlanner'
>;

interface Props {
  navigation: JourneyPlannerScreenNavigationProp;
}

const JourneyPlannerScreen: React.FC<Props> = ({ navigation }) => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');

  const handlePlanJourney = () => {
    // TODO: Implement journey planning logic
    console.log('Planning journey...');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plan Your Journey</Text>
        <Text style={styles.headerSubtitle}>
          Find the best time to travel and avoid delays
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Journey Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>From</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Current location or address"
            value={fromLocation}
            onChangeText={setFromLocation}
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>To</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Destination address or Eircode"
            value={toLocation}
            onChangeText={setToLocation}
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.timeInputs}>
          <View style={styles.timeInput}>
            <Text style={styles.label}>Departure Time</Text>
            <TextInput
              style={styles.textInput}
              placeholder="HH:MM"
              value={departureTime}
              onChangeText={setDepartureTime}
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={styles.timeInput}>
            <Text style={styles.label}>Arrival Time</Text>
            <TextInput
              style={styles.textInput}
              placeholder="HH:MM"
              value={arrivalTime}
              onChangeText={setArrivalTime}
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.planButton} onPress={handlePlanJourney}>
          <Text style={styles.planButtonText}>Find Best Route</Text>
        </TouchableOpacity>
      </View>

      {/* Sample Results Section */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>Suggested Departure Times</Text>

        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.optimalBadge}>⭐ OPTIMAL</Text>
            <Text style={styles.departureTime}>16:45</Text>
          </View>
          <Text style={styles.resultDetails}>
            Bus 46A • 45 min journey • 18 stops
          </Text>
          <Text style={styles.resultTraffic}>🟡 Moderate traffic expected</Text>
          <Text style={styles.resultWeather}>
            🌧️ 12°C, Light rain during journey
          </Text>
        </View>

        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.alternativeBadge}>ALTERNATIVE</Text>
            <Text style={styles.departureTime}>17:00</Text>
          </View>
          <Text style={styles.resultDetails}>
            Bus 145 • 35 min journey • 14 stops
          </Text>
          <Text style={styles.resultTraffic}>🟢 Light traffic expected</Text>
          <Text style={styles.resultWeather}>☁️ 13°C, Cloudy throughout</Text>
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
    paddingTop: STYLES.spacing.xl,
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
  formSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: STYLES.spacing.lg,
  },
  inputGroup: {
    marginBottom: STYLES.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: STYLES.spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: STYLES.borderRadius.md,
    padding: STYLES.spacing.md,
    fontSize: 16,
    color: COLORS.text,
  },
  timeInputs: {
    flexDirection: 'row',
    gap: STYLES.spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  planButton: {
    backgroundColor: COLORS.primary,
    padding: STYLES.spacing.md,
    borderRadius: STYLES.borderRadius.md,
    alignItems: 'center',
    marginTop: STYLES.spacing.md,
  },
  planButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsSection: {
    margin: STYLES.spacing.md,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: STYLES.spacing.sm,
  },
  optimalBadge: {
    backgroundColor: COLORS.success,
    color: COLORS.white,
    paddingHorizontal: STYLES.spacing.sm,
    paddingVertical: STYLES.spacing.xs,
    borderRadius: STYLES.borderRadius.sm,
    fontSize: 12,
    fontWeight: 'bold',
  },
  alternativeBadge: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
    paddingHorizontal: STYLES.spacing.sm,
    paddingVertical: STYLES.spacing.xs,
    borderRadius: STYLES.borderRadius.sm,
    fontSize: 12,
    fontWeight: 'bold',
  },
  departureTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultDetails: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: STYLES.spacing.xs,
  },
  resultTraffic: {
    fontSize: 12,
    color: COLORS.warning,
    marginBottom: STYLES.spacing.xs,
  },
  resultWeather: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
});

export default JourneyPlannerScreen;
