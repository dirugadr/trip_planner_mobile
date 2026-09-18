import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Luggage, LogOut } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthContext';
import { listTrips } from '../api/trips';
import { ApiError } from '../api/client';
import { Trip } from '../types/trip';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatDateRange, tripDays } from '../utils/format';
import { resolvePhotoUrl } from '../utils/media';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Trips'>;

export function TripsListScreen() {
  const navigation = useNavigation<Navigation>();
  const { logout } = useAuth();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setTrips(await listTrips());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar tus viajes');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => void logout()} hitSlop={12} style={styles.logoutButton}>
          <LogOut size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      ),
    });
  }, [navigation, logout]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (trips === null && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error && trips === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={trips?.length ? styles.listContent : styles.emptyContent}
      data={trips ?? []}
      keyExtractor={(trip) => trip.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={styles.emptyText}>Todavía no tenés viajes creados.</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Itinerary', { tripId: item.id, tripName: item.name })}
        >
          {item.cover_photo_url ? (
            <Image source={{ uri: resolvePhotoUrl(item.cover_photo_url)! }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoFallback]}>
              <Luggage size={28} color={colors.onSurfaceVariant} opacity={0.5} />
            </View>
          )}
          <View style={styles.cardBody}>
            <Text style={styles.tripName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.tripDates}>
              {formatDateRange(item.start_date, item.end_date)} ·{' '}
              {tripDays(item.start_date, item.end_date)} días
            </Text>
          </View>
          <ChevronRight size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  errorText: {
    fontFamily: fonts.regular,
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '33',
    overflow: 'hidden',
    alignItems: 'center',
  },
  photo: {
    width: 96,
    height: 96,
  },
  photoFallback: {
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 12,
  },
  tripName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  tripDates: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 4,
  },
});
