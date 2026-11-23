import { CropCategory, CropStatus } from './farmer';

export type OfferStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';

export interface PurchaseRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  cropName: string;
  category: CropCategory;
  quantityKg: number;
  targetPricePerKg: number;
  preferredDistrict: string;
  requiredDate: string;
  additionalNotes: string;
  contactPhone: string;
  status: 'Active' | 'Fulfilled' | 'Closed';
  createdAt: string;
}

export interface FarmerLead {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  district: string;
  village: string;
  bio: string;
  rating: number;
  activeListingsCount: number;
  cropsOffered: string[];
  totalHarvestSoldKg: number;
}

export interface BuyerNotification {
  id: string;
  type: 'offer_accepted' | 'offer_rejected' | 'crop_match' | 'requirement_update' | 'announcement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
}

export type CropSortOption = 'newest' | 'price_asc' | 'price_desc' | 'quantity_desc';
