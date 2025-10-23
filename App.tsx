import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import LiveMapScreen from './src/screens/LiveMapScreen';
import JourneyPlannerScreen from './src/screens/JourneyPlanner';

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

export type RootStackParamList = {
  Home: undefined;
  SearchResults: {
    eircode: string;
    userLocation: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
    destinationName: string;
    distance?: number;
  };
  LiveMap: {
    busData: any[];
    destination: { latitude: number; longitude: number };
  };
  JourneyPlanner: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTintColor: COLORS.white,
          headerTitleStyle: styles.headerTitle,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Dublin Bus & Weather' }}
        />
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={{ title: 'Search Results' }}
        />
        <Stack.Screen
          name="LiveMap"
          component={LiveMapScreen}
          options={{ title: 'Live Map' }}
        />
        <Stack.Screen
          name="JourneyPlanner"
          component={JourneyPlannerScreen}
          options={{ title: 'Plan Journey' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
});

export default App;
