export interface Trip {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  currency_code: string;
  total_budget: number | null;
  timezone: string;
  last_viewed_day_id: string | null;
  cover_photo_url: string | null;
}

export interface TripDetail extends Trip {
  days: Day[];
}

export interface Day {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title: string | null;
  notes: string | null;
  activities: Activity[];
}

export interface Poi {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  photo_url: string | null;
  photo_source: 'auto_wikipedia' | 'manual' | null;
  category_name: string | null;
  category_icon: string | null;
}

export interface Activity {
  id: string;
  day_id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  duration_minutes: number | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  completed: 0 | 1;
  tentative: 0 | 1;
  is_fixed: 0 | 1;
  accommodation_id: string | null;
  pois: Poi[];
}

export interface RouteViewStop {
  sequence_number: number;
  activity_id: string;
  activity_name: string;
  poi_name: string;
  poi_category: string;
  lat: number;
  lng: number;
}

export interface RouteViewSegment {
  from: number;
  to: number;
  no_walk: boolean;
  coordinates: [number, number][];
  source: 'osrm' | 'straight';
}

export interface RouteView {
  stops: RouteViewStop[];
  segments: RouteViewSegment[];
  activities_without_poi_count: number;
}
