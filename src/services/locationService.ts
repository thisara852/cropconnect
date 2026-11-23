import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import {
  GeoCoordinates,
  UserLocationPreference,
  LocationPermissionStatus,
  MatchResult,
  MatchTier,
  AgriMarketCentre,
} from '../types/location';
import { CropListing } from '../types/farmer';
import { PurchaseRequirement } from '../types/buyer';

const STORAGE_KEY_LOCATION = '@cropconnect_user_location_v1';

// Precise Sri Lankan Geographic Coordinates (District Capitals & Economic Nodes)
export const DISTRICT_COORDINATES: Record<string, GeoCoordinates> = {
  dambulla: { latitude: 7.8731, longitude: 80.6517 },
  matale: { latitude: 7.4675, longitude: 80.6234 },
  anuradhapura: { latitude: 8.3114, longitude: 80.4037 },
  'nuwara eliya': { latitude: 6.9497, longitude: 80.7891 },
  'nuwara-eliya': { latitude: 6.9497, longitude: 80.7891 },
  kandy: { latitude: 7.2906, longitude: 80.6337 },
  badulla: { latitude: 6.9934, longitude: 81.055 },
  jaffna: { latitude: 9.6615, longitude: 80.0255 },
  kurunegala: { latitude: 7.4863, longitude: 80.3623 },
  colombo: { latitude: 6.9271, longitude: 79.8612 },
  gampaha: { latitude: 7.084, longitude: 80.0098 },
  kalutara: { latitude: 6.5854, longitude: 79.9607 },
  galle: { latitude: 6.0535, longitude: 80.221 },
  matara: { latitude: 5.9549, longitude: 80.555 },
  hambantota: { latitude: 6.1429, longitude: 81.1212 },
  polonnaruwa: { latitude: 7.9403, longitude: 81.0188 },
  monaragala: { latitude: 6.8728, longitude: 81.3507 },
  ratnapura: { latitude: 6.7056, longitude: 80.3847 },
  kegalle: { latitude: 7.2513, longitude: 80.3464 },
  puttalam: { latitude: 8.0408, longitude: 79.8394 },
  trincomalee: { latitude: 8.5874, longitude: 81.2152 },
  batticaloa: { latitude: 7.731, longitude: 81.6747 },
  ampara: { latitude: 7.2885, longitude: 81.6724 },
  vavuniya: { latitude: 8.7514, longitude: 80.4971 },
  mannar: { latitude: 8.981, longitude: 79.9044 },
  kilinochchi: { latitude: 9.3803, longitude: 80.377 },
  mullaitivu: { latitude: 9.2671, longitude: 80.8143 },
};

// Sri Lankan Dedicated Economic Centres (DEC) & Major Agri Terminals
export const SRI_LANKAN_MARKETS: AgriMarketCentre[] = [
  {
    id: 'mkt_dambulla',
    name: 'Dambulla Dedicated Economic Centre (DEC)',
    type: 'Dedicated Economic Centre',
    district: 'Matale',
    coords: { latitude: 7.8639, longitude: 80.6528 },
    operatingHours: '24 Hours Daily • Peak 04:00 - 18:00',
    keyCommodities: ['Big Onions', 'Vegetables', 'Potatoes', 'Green Chillies'],
    contactPhone: '+94 66 228 4725',
  },
  {
    id: 'mkt_nuwaraeliya',
    name: 'Nuwara Eliya Economic Centre',
    type: 'Dedicated Economic Centre',
    district: 'Nuwara Eliya',
    coords: { latitude: 6.9532, longitude: 80.7814 },
    operatingHours: '05:00 - 20:00 Daily',
    keyCommodities: ['Carrots', 'Leeks', 'Beetroot', 'Cabbage', 'Potatoes'],
    contactPhone: '+94 52 222 3401',
  },
  {
    id: 'mkt_keppetipola',
    name: 'Keppetipola Dedicated Economic Centre',
    type: 'Dedicated Economic Centre',
    district: 'Badulla',
    coords: { latitude: 6.892, longitude: 80.8931 },
    operatingHours: '06:00 - 18:00 Daily',
    keyCommodities: ['Upcountry Vegetables', 'Cabbage', 'Beans'],
    contactPhone: '+94 57 228 0122',
  },
  {
    id: 'mkt_meegoda',
    name: 'Meegoda Dedicated Economic Centre',
    type: 'Dedicated Economic Centre',
    district: 'Colombo',
    coords: { latitude: 6.8415, longitude: 80.0528 },
    operatingHours: '04:00 - 19:00 Daily',
    keyCommodities: ['Low Country Vegetables', 'Fruits', 'Tubers'],
    contactPhone: '+94 11 275 1902',
  },
  {
    id: 'mkt_pettah',
    name: 'Peliyagoda Central Manning Market Terminal',
    type: 'Wholesale Terminal',
    district: 'Colombo',
    coords: { latitude: 6.9634, longitude: 79.8856 },
    operatingHours: '02:00 - 16:00 Daily',
    keyCommodities: ['National Wholesale Consolidation', 'All Island Crops'],
    contactPhone: '+94 11 243 5122',
  },
  {
    id: 'mkt_thambuthegama',
    name: 'Thambuthegama Dedicated Economic Centre',
    type: 'Dedicated Economic Centre',
    district: 'Anuradhapura',
    coords: { latitude: 8.1472, longitude: 80.2986 },
    operatingHours: '05:00 - 18:00 Daily',
    keyCommodities: ['Paddy', 'Grains', 'Dry Zone Vegetables', 'Papaya'],
    contactPhone: '+94 25 227 6301',
  },
];

export const locationService = {
  // --- HAVERSINE GEOGRAPHIC DISTANCE FORMULA ---
  calculateHaversineDistance(
    coord1?: GeoCoordinates,
    coord2?: GeoCoordinates
  ): number | null {
    if (!coord1 || !coord2) return null;
    if (
      typeof coord1.latitude !== 'number' ||
      typeof coord1.longitude !== 'number' ||
      typeof coord2.latitude !== 'number' ||
      typeof coord2.longitude !== 'number'
    ) {
      return null;
    }

    const R = 6371; // Earth's mean radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    const lat1 = this.toRadians(coord1.latitude);
    const lat2 = this.toRadians(coord2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  },

  toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  },

  formatDistance(distanceKm: number | null): string {
    if (distanceKm === null || isNaN(distanceKm)) {
      return 'Distance unavailable';
    }
    if (distanceKm < 1) {
      return '< 1 km away';
    }
    return `${distanceKm} km away`;
  },

  // --- DISTRICT LOOKUP ---
  getDistrictCoordinates(districtName?: string): GeoCoordinates {
    if (!districtName) {
      return DISTRICT_COORDINATES.dambulla; // Agricultural epicenter of Sri Lanka
    }
    const clean = districtName.toLowerCase().trim();
    if (DISTRICT_COORDINATES[clean]) {
      return DISTRICT_COORDINATES[clean];
    }
    // Partial substring match
    for (const key of Object.keys(DISTRICT_COORDINATES)) {
      if (clean.includes(key) || key.includes(clean)) {
        return DISTRICT_COORDINATES[key];
      }
    }
    return DISTRICT_COORDINATES.dambulla;
  },

  // --- LOCATION PREFERENCE PERSISTENCE ---
  async getUserLocationPreference(): Promise<UserLocationPreference> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_LOCATION);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}

    // Default: Dambulla, Sri Lanka
    return {
      coords: DISTRICT_COORDINATES.dambulla,
      district: 'Dambulla',
      townOrVillage: 'Dedicated Economic Center Area',
      useGps: false,
      permissionStatus: 'undetermined',
      shareLocationWithOthers: true,
    };
  },

  async saveUserLocationPreference(pref: UserLocationPreference): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(pref));
    } catch (e) {
      console.error('Failed to save location preference:', e);
    }
  },

  // --- LOCATION PERMISSION FLOW (Cross-Platform with Expo Native & Web Geolocation) ---
  async requestDeviceLocation(): Promise<{
    status: LocationPermissionStatus;
    coords?: GeoCoordinates;
  }> {
    // Attempt Expo Location if installed in runtime environment
    try {
      const ExpoLocation = require('expo-location');
      if (ExpoLocation && ExpoLocation.requestForegroundPermissionsAsync) {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy?.Balanced || 3,
          });
          const coords: GeoCoordinates = {
            latitude: Math.round(loc.coords.latitude * 10000) / 10000,
            longitude: Math.round(loc.coords.longitude * 10000) / 10000,
          };
          return { status: 'granted', coords };
        } else {
          return { status: 'denied' };
        }
      }
    } catch {
      // Fall through to browser navigator
    }

    // Cross-platform check using standard Web navigator.geolocation
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords: GeoCoordinates = {
              latitude: Math.round(pos.coords.latitude * 10000) / 10000,
              longitude: Math.round(pos.coords.longitude * 10000) / 10000,
            };
            resolve({ status: 'granted', coords });
          },
          () => {
            resolve({ status: 'denied' });
          },
          { enableHighAccuracy: false, timeout: 6000 }
        );
      });
    }

    return { status: 'denied' };
  },

  // --- EXTERNAL MAPS LAUNCHER ---
  openExternalMaps(coords: GeoCoordinates, label?: string): void {
    const lat = coords.latitude;
    const lng = coords.longitude;
    const query = label ? encodeURIComponent(label) : `${lat},${lng}`;

    const url = Platform.select({
      ios: `maps:0,0?q=${query}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${query})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    });
  },

  // --- SMART RULE-BASED MATCHING FOR FARMERS (Finding Buyers) ---
  matchBuyersForFarmer(
    farmerListing: {
      cropName: string;
      category?: string;
      quantityKg: number;
      pricePerKg: number;
      district: string;
      coords?: GeoCoordinates;
    },
    buyers: Array<{
      id: string;
      businessName: string;
      ownerName: string;
      district: string;
      businessType: string;
      phone: string;
      requiredCrop?: string;
      requiredQuantityKg?: number;
      maxPricePerKg?: number;
      verificationStatus?: string;
      coords?: GeoCoordinates;
    }>
  ): MatchResult<any>[] {
    const farmerCoords = farmerListing.coords || this.getDistrictCoordinates(farmerListing.district);

    return buyers
      .map((buyer) => {
        const buyerCoords = buyer.coords || this.getDistrictCoordinates(buyer.district);
        const distanceKm = this.calculateHaversineDistance(farmerCoords, buyerCoords);
        const distanceFormatted = this.formatDistance(distanceKm);

        let score = 0;
        const reasons: string[] = [];

        // 1. Crop Match
        const buyerCrop = (buyer.requiredCrop || '').toLowerCase();
        const listingCrop = farmerListing.cropName.toLowerCase();

        if (buyerCrop && (listingCrop.includes(buyerCrop) || buyerCrop.includes(listingCrop))) {
          score += 40;
          reasons.push(`Exact crop demand match (${buyer.requiredCrop})`);
        } else if (buyer.businessType.toLowerCase().includes('supermarket') || buyer.businessType.toLowerCase().includes('wholesale')) {
          score += 20;
          reasons.push('Broad-line commercial purchaser');
        } else {
          score += 10;
        }

        // 2. Geographic Proximity
        if (distanceKm !== null) {
          if (distanceKm <= 25) {
            score += 30;
            reasons.push(`Close proximity: only ${distanceKm} km away`);
          } else if (distanceKm <= 60) {
            score += 20;
            reasons.push(`Regional district corridor: ${distanceKm} km`);
          } else if (distanceKm <= 120) {
            score += 10;
            reasons.push(`Highway transit range: ${distanceKm} km`);
          } else {
            score += 5;
          }
        }

        // 3. Price Target Compatibility
        if (buyer.maxPricePerKg) {
          if (buyer.maxPricePerKg >= farmerListing.pricePerKg) {
            score += 20;
            reasons.push(`Buyer budget (LKR ${buyer.maxPricePerKg}) covers asking price (LKR ${farmerListing.pricePerKg})`);
          } else if (farmerListing.pricePerKg - buyer.maxPricePerKg <= 20) {
            score += 10;
            reasons.push(`Near target price (LKR ${buyer.maxPricePerKg}/kg ceiling)`);
          }
        } else {
          score += 10;
        }

        // 4. Verification Credibility
        if (buyer.verificationStatus === 'Verified') {
          score += 10;
          reasons.push('Verified enterprise with valid BRN clearance');
        }

        score = Math.min(100, Math.max(20, score));

        let matchTier: MatchTier = 'Possible Match';
        if (score >= 80) matchTier = 'Excellent Match';
        else if (score >= 60) matchTier = 'Good Match';

        return {
          item: buyer,
          distanceKm,
          distanceFormatted,
          matchScore: score,
          matchTier,
          matchReasons: reasons,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  },

  // --- SMART RULE-BASED MATCHING FOR BUYERS (Finding Farmer Lots) ---
  matchFarmersForBuyer(
    buyerRequirement: {
      cropName: string;
      category?: string;
      quantityKg?: number;
      targetPricePerKg?: number;
      preferredDistrict?: string;
      coords?: GeoCoordinates;
    },
    crops: CropListing[]
  ): MatchResult<CropListing>[] {
    const buyerCoords = buyerRequirement.coords || this.getDistrictCoordinates(buyerRequirement.preferredDistrict);

    return crops
      .map((crop) => {
        const cropCoords = this.getDistrictCoordinates(crop.district);
        const distanceKm = this.calculateHaversineDistance(buyerCoords, cropCoords);
        const distanceFormatted = this.formatDistance(distanceKm);

        let score = 0;
        const reasons: string[] = [];

        // 1. Crop Identity Alignment
        const reqName = (buyerRequirement.cropName || '').toLowerCase();
        const cropName = crop.cropName.toLowerCase();

        if (reqName && (cropName.includes(reqName) || reqName.includes(cropName))) {
          score += 40;
          reasons.push(`Crop matched (${crop.cropName})`);
        } else if (buyerRequirement.category && crop.category === buyerRequirement.category) {
          score += 20;
          reasons.push(`Matching category (${crop.category})`);
        } else {
          score += 10;
        }

        // 2. Distance Proximity
        if (distanceKm !== null) {
          if (distanceKm <= 25) {
            score += 30;
            reasons.push(`Local farmgate pickup: ${distanceKm} km`);
          } else if (distanceKm <= 60) {
            score += 20;
            reasons.push(`Short transit corridor: ${distanceKm} km`);
          } else if (distanceKm <= 120) {
            score += 10;
            reasons.push(`Direct lorry route: ${distanceKm} km`);
          } else {
            score += 5;
          }
        }

        // 3. Price Target Match
        if (buyerRequirement.targetPricePerKg) {
          if (crop.pricePerKg <= buyerRequirement.targetPricePerKg) {
            score += 20;
            reasons.push(`Price LKR ${crop.pricePerKg} is within your target ceiling (LKR ${buyerRequirement.targetPricePerKg})`);
          } else if (crop.pricePerKg - buyerRequirement.targetPricePerKg <= 25) {
            score += 10;
            reasons.push('Asking price within negotiable range');
          }
        } else {
          score += 10;
        }

        // 4. Quantity Volume Availability
        if (buyerRequirement.quantityKg) {
          if (crop.quantityKg >= buyerRequirement.quantityKg) {
            score += 10;
            reasons.push(`Full lot available (${crop.quantityKg} kg fulfills demand)`);
          } else {
            score += 5;
            reasons.push(`Partial harvest batch (${crop.quantityKg} kg)`);
          }
        }

        score = Math.min(100, Math.max(20, score));

        let matchTier: MatchTier = 'Possible Match';
        if (score >= 80) matchTier = 'Excellent Match';
        else if (score >= 60) matchTier = 'Good Match';

        return {
          item: crop,
          distanceKm,
          distanceFormatted,
          matchScore: score,
          matchTier,
          matchReasons: reasons,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  },
};
