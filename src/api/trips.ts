import { apiClient } from './client';
import { Trip, TripDetail } from '../types/trip';

// GET /api/trips — ya viene ordenado por start_date ASC desde el backend.
export function listTrips(): Promise<Trip[]> {
  return apiClient.get<Trip[]>('/api/trips');
}

// GET /api/trips/:id — trip completo con days[] y activities[] anidados.
export function getTripDetail(tripId: string): Promise<TripDetail> {
  return apiClient.get<TripDetail>(`/api/trips/${tripId}`);
}

// PUT /api/trips/:tripId/last-viewed-day — best-effort, no bloquea la UI.
export function setLastViewedDay(tripId: string, dayId: string): Promise<Trip> {
  return apiClient.put<Trip>(`/api/trips/${tripId}/last-viewed-day`, { day_id: dayId });
}
