import { apiClient } from './client';
import { RouteView } from '../types/trip';

// GET /api/days/:dayId/route-view — geometría cruda (sin minutos/km, eso se
// calcula en el cliente, ver src/utils/geo.ts).
export function getDayRouteView(dayId: string): Promise<RouteView> {
  return apiClient.get<RouteView>(`/api/days/${dayId}/route-view`);
}
