import { RouteView } from '../types/trip';

const EARTH_RADIUS_M = 6371000;
// Mismo criterio que WALK_METERS_PER_MIN en backend/src/services/routing.js
// (duplicado a propósito: el backend no expone minutos/km, solo geometría).
const WALK_METERS_PER_MIN = 80;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineMeters(a: [number, number], b: [number, number]): number {
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

function segmentDistanceKm(coordinates: [number, number][]): number {
  let meters = 0;
  for (let i = 1; i < coordinates.length; i++) {
    meters += haversineMeters(coordinates[i - 1], coordinates[i]);
  }
  return meters / 1000;
}

export function walkMinutesForKm(km: number): number {
  return Math.round((km * 1000) / WALK_METERS_PER_MIN);
}

export interface WalkConnector {
  minutes: number;
  km: number;
  noWalk: boolean;
  toTitle: string;
}

// Mapa activityId -> conector "hacia la siguiente actividad". Cada segmento
// de route-view ya representa exactamente un tramo entre dos paradas
// consecutivas, así que mapea 1:1 al conector entre actividades del spec.
export function buildWalkConnectors(routeView: RouteView): Map<string, WalkConnector> {
  const stopBySequence = new Map(routeView.stops.map((stop) => [stop.sequence_number, stop]));
  const connectors = new Map<string, WalkConnector>();

  for (const segment of routeView.segments) {
    const fromStop = stopBySequence.get(segment.from);
    const toStop = stopBySequence.get(segment.to);
    if (!fromStop || !toStop) continue;

    const km = segmentDistanceKm(segment.coordinates);
    connectors.set(fromStop.activity_id, {
      minutes: walkMinutesForKm(km),
      km,
      noWalk: segment.no_walk,
      toTitle: toStop.poi_name || toStop.activity_name,
    });
  }

  return connectors;
}
