import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { TripsListScreen } from '../screens/TripsListScreen';
import { ItineraryScreen } from '../screens/ItineraryScreen';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export type RootStackParamList = {
  Login: undefined;
  Trips: undefined;
  Itinerary: { tripId: string; tripName?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { fontFamily: fonts.semiBold, color: colors.onSurface },
          headerShadowVisible: false,
        }}
      >
        {status === 'authenticated' ? (
          <>
            <Stack.Screen name="Trips" component={TripsListScreen} options={{ title: 'Tus viajes' }} />
            <Stack.Screen
              name="Itinerary"
              component={ItineraryScreen}
              options={({ route }) => ({ title: route.params.tripName ?? 'Itinerario' })}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
