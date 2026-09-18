import {
  Hotel,
  Landmark,
  LucideIcon,
  MapPin,
  Palette,
  TrainFront,
  Trees,
  UtensilsCrossed,
} from 'lucide-react-native';

// Mapea Poi.category_icon (mismo valor que usa la web en categoryMsi, ver
// frontend/src/utils/poiCategories.js) a un ícono nativo equivalente.
const ICONS_BY_CATEGORY: Record<string, LucideIcon> = {
  landmark: Landmark,
  train: TrainFront,
  bed: Hotel,
  utensils: UtensilsCrossed,
  leaf: Trees,
  palette: Palette,
};

export function getCategoryIcon(categoryIcon: string | null | undefined): LucideIcon {
  if (!categoryIcon) return MapPin;
  return ICONS_BY_CATEGORY[categoryIcon] ?? MapPin;
}
