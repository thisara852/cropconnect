export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface UserLocationPreference {
  coords?: GeoCoordinates;
  district: string;
  townOrVillage: string;
  useGps: boolean;
  permissionStatus: LocationPermissionStatus;
  shareLocationWithOthers: boolean;
}

export type MarkerType = 'farmer' | 'buyer' | 'crop' | 'market';

export interface MapMarkerItem {
  id: string;
  type: MarkerType;
  title: string;
  subtitle: string;
  coords: GeoCoordinates;
  district: string;
  village?: string;
  rating?: number;
  pricePerKg?: number;
  quantityKg?: number;
  crops?: string[];
  phone?: string;
  isVerified?: boolean;
  isRescue?: boolean;
  targetId?: string; // Links to crop, farmer, or buyer id
}

export type MatchTier = 'Excellent Match' | 'Good Match' | 'Possible Match';

export interface MatchResult<T> {
  item: T;
  distanceKm: number | null;
  distanceFormatted: string;
  matchScore: number; // 0 - 100
  matchTier: MatchTier;
  matchReasons: string[];
}

export interface AgriMarketCentre {
  id: string;
  name: string;
  type: 'Dedicated Economic Centre' | 'Wholesale Terminal' | 'Agrarian Service Centre';
  district: string;
  coords: GeoCoordinates;
  operatingHours: string;
  keyCommodities: string[];
  contactPhone: string;
}
