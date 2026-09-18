import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Footprints, Lock, MapPin, TrainFront } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { getTripDetail, setLastViewedDay } from '../api/trips';
import { getDayRouteView } from '../api/days';
import { ApiError } from '../api/client';
import { Activity, Day, TripDetail } from '../types/trip';
import { buildWalkConnectors, WalkConnector } from '../utils/geo';
import { formatEndTime, formatShortDay } from '../utils/format';
import { resolvePhotoUrl } from '../utils/media';
import { getCategoryIcon } from '../theme/categoryIcons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Route = RouteProp<RootStackParamList, 'Itinerary'>;

export function ItineraryScreen() {
  const { params } = useRoute<Route>();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<Map<string, WalkConnector>>(new Map());

  useEffect(() => {
    (async () => {
      try {
        const detail = await getTripDetail(params.tripId);
        setTrip(detail);
        const defaultDay =
          detail.days.find((d) => d.id === detail.last_viewed_day_id) ?? detail.days[0] ?? null;
        setSelectedDayId(defaultDay?.id ?? null);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'No se pudo cargar el itinerario');
      }
    })();
  }, [params.tripId]);

  useEffect(() => {
    if (!selectedDayId) return;
    setConnectors(new Map());
    getDayRouteView(selectedDayId)
      .then((routeView) => setConnectors(buildWalkConnectors(routeView)))
      .catch(() => setConnectors(new Map()));
  }, [selectedDayId]);

  const selectDay = useCallback(
    (day: Day) => {
      setSelectedDayId(day.id);
      setLastViewedDay(params.tripId, day.id).catch(() => {});
    },
    [params.tripId]
  );

  const selectedDay = useMemo(
    () => trip?.days.find((d) => d.id === selectedDayId) ?? null,
    [trip, selectedDayId]
  );

  if (!trip && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error && !trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={selectedDay?.activities ?? []}
      keyExtractor={(activity) => activity.id}
      ListHeaderComponent={
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabs}>
          {trip!.days.map((day) => {
            const active = day.id === selectedDayId;
            return (
              <Pressable
                key={day.id}
                onPress={() => selectDay(day)}
                style={[styles.dayPill, active && styles.dayPillActive]}
              >
                <Text style={[styles.dayPillEyebrow, active && styles.dayPillTextActive]}>
                  Día {day.day_number} · {formatShortDay(day.date)}
                </Text>
                <Text style={[styles.dayPillCount, active && styles.dayPillTextActive]}>
                  {day.activities.length} activ.
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>Este día todavía no tiene actividades.</Text>
      }
      renderItem={({ item, index }) => (
        <ActivityCard
          activity={item}
          connector={connectors.get(item.id)}
          isLast={index === (selectedDay?.activities.length ?? 0) - 1}
        />
      )}
    />
  );
}

function ActivityCard({
  activity,
  connector,
  isLast,
}: {
  activity: Activity;
  connector: WalkConnector | undefined;
  isLast: boolean;
}) {
  const primaryPoi = activity.pois[0];
  const CategoryIcon = getCategoryIcon(primaryPoi?.category_icon);
  const endTime = formatEndTime(activity.start_time, activity.duration_minutes);
  const photoUrl = resolvePhotoUrl(primaryPoi?.photo_url ?? null);

  return (
    <View style={styles.activityWrapper}>
      <View style={styles.card}>
        {primaryPoi ? (
          photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.activityPhoto} />
          ) : (
            <View style={[styles.activityPhoto, styles.activityPhotoFallback]}>
              <CategoryIcon size={28} color={colors.onSurfaceVariant} opacity={0.5} />
            </View>
          )
        ) : null}

        <View style={styles.cardBody}>
          <View style={styles.rowWrap}>
            <Text style={styles.time}>
              {activity.start_time ?? '—'}
              {endTime ? ` – ${endTime}` : ''}
            </Text>
            {activity.is_fixed ? <Lock size={14} color={colors.onSurfaceVariant} /> : null}
          </View>

          <View style={styles.rowWrap}>
            {primaryPoi ? (
              <View style={styles.categoryTag}>
                <CategoryIcon size={12} color={colors.tertiary} />
                <Text style={styles.categoryTagText}>{primaryPoi.category_name}</Text>
              </View>
            ) : null}
            <View style={styles.statusTag}>
              <Text style={styles.statusTagText}>{activity.tentative ? 'Tentativa' : 'Confirmada'}</Text>
            </View>
          </View>

          <Text style={styles.activityTitle} numberOfLines={2}>
            {activity.title}
          </Text>
          {activity.description ? (
            <Text style={styles.muted} numberOfLines={2}>
              {activity.description}
            </Text>
          ) : null}

          {primaryPoi ? (
            <View style={styles.rowWrap}>
              <MapPin size={14} color={colors.onSurfaceVariant} />
              <Text style={styles.locationText} numberOfLines={1}>
                {primaryPoi.address || primaryPoi.name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {!isLast && connector ? (
        <View style={styles.connectorRow}>
          {connector.noWalk ? (
            <TrainFront size={14} color={colors.onSurfaceVariant} />
          ) : (
            <Footprints size={14} color={colors.onSurfaceVariant} />
          )}
          <Text style={styles.connectorText}>
            {connector.noWalk
              ? 'sin recorrido a pie'
              : `${connector.minutes} min a pie${
                  connector.minutes > 5 ? ` (${connector.km.toFixed(1)} km)` : ''
                } hacia ${connector.toTitle}`}
          </Text>
        </View>
      ) : null}
    </View>
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
  errorText: {
    fontFamily: fonts.regular,
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  listContent: {
    padding: 16,
  },
  dayTabs: {
    marginBottom: 16,
  },
  dayPill: {
    minWidth: 130,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    marginRight: 8,
  },
  dayPillActive: {
    backgroundColor: colors.primary,
  },
  dayPillEyebrow: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  dayPillCount: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.onSurface,
    marginTop: 2,
  },
  dayPillTextActive: {
    color: colors.onPrimary,
  },
  activityWrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '33',
    overflow: 'hidden',
  },
  activityPhoto: {
    width: 112,
    height: 112,
  },
  activityPhotoFallback: {
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 10,
    gap: 4,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tertiaryContainer,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryTagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.tertiary,
  },
  statusTag: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusTagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  activityTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  muted: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  locationText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginLeft: 4,
  },
  connectorText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});
