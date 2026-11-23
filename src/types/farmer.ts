export type CropCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Grains & Paddy'
  | 'Spices'
  | 'Tubers & Roots';

export type CropStatus = 'Active' | 'Under Offer' | 'Sold' | 'Rescue Alert';

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAvatar?: string;
  cropName: string;
  category: CropCategory;
  imageUrl: string;
  quantityKg: number;
  pricePerKg: number;
  harvestDate: string;
  district: string;
  village: string;
  description: string;
  status: CropStatus;
  createdAt: string;
  viewsCount: number;
  offersCount: number;
  isRescue?: boolean;
}

export interface BuyerLead {
  id: string;
  businessName: string;
  ownerName: string;
  avatarUrl: string;
  district: string;
  distanceKm: number;
  requiredCrop: string;
  requiredQuantityKg: number;
  maxPricePerKg: number;
  businessType: string;
  phone: string;
  email: string;
  address: string;
  verified: boolean;
  rating: number;
  purchasingNotes: string;
  activeOrdersCount: number;
}

export interface BuyerOffer {
  id: string;
  cropListingId: string;
  cropName: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  buyerLocation: string;
  offeredPricePerKg: number;
  requestedQuantityKg: number;
  totalValueLkr: number;
  offerDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  isBestOffer?: boolean;
  buyerPhone: string;
  notes?: string;
}

export interface AIFairPriceFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  text: string;
}

export interface AIFairPricePrediction {
  cropName: string;
  district: string;
  predictedPricePerKg: number;
  minPricePerKg: number;
  maxPricePerKg: number;
  confidenceScore: number;
  dambullaWholesalePrice: number;
  pettahWholesalePrice: number;
  meegodaWholesalePrice: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  explanation: string;
  factors: AIFairPriceFactor[];
}

export interface PriceHistoryPoint {
  date: string;
  label: string;
  price: number;
  volumeKg?: number;
}

export interface FarmerNotification {
  id: string;
  type: 'offer' | 'enquiry' | 'listing' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
}

export interface CropPresetPhoto {
  cropName: string;
  category: CropCategory;
  imageUrl: string;
}
