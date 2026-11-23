import { CropCategory, CropStatus } from './farmer';
import { OfferStatus } from './buyer';

export type UserAccountStatus = 'Active' | 'Suspended';
export type BuyerVerificationStatus = 'Verified' | 'Pending' | 'Rejected' | 'Suspended';

export interface AdminFarmerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  village: string;
  avatarUrl: string;
  registrationDate: string;
  status: UserAccountStatus;
  listingsCount: number;
  totalSoldKg: number;
  rating: number;
}

export interface AdminBuyerUser {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  district: string;
  businessAddress: string;
  businessType: string;
  registrationDate: string;
  verificationStatus: BuyerVerificationStatus;
  brnNumber: string;
  documentsSubmitted: string;
  offersCount: number;
  requirementsCount: number;
}

export interface MarketPriceRecord {
  id: string;
  cropName: string;
  category: CropCategory;
  district: string;
  minPricePerKg: number;
  avgPricePerKg: number;
  maxPricePerKg: number;
  recordedDate: string;
  sourceReference: string;
  isVerifiedGovt: boolean;
}

export type ComplaintCategory =
  | 'Payment Issue'
  | 'Quality Dispute'
  | 'Logistics Delay'
  | 'Price Discrepancy'
  | 'Platform Technical'
  | 'Account & Identity';

export type ComplaintStatus = 'Pending' | 'Under Review' | 'Resolved' | 'Rejected';

export interface AdminComplaint {
  id: string;
  ticketNumber: string;
  submittedByName: string;
  submittedByPhone: string;
  userRole: 'farmer' | 'buyer';
  category: ComplaintCategory;
  subject: string;
  description: string;
  submittedDate: string;
  status: ComplaintStatus;
  adminResponse?: string;
  resolvedDate?: string;
}

export type TargetAudience = 'All Users' | 'Farmers' | 'Buyers';

export interface PlatformAnnouncement {
  id: string;
  title: string;
  message: string;
  targetAudience: TargetAudience;
  publishedDate: string;
  priority: 'Normal' | 'High' | 'Urgent';
  authorName: string;
  isActive: boolean;
}

export interface PlatformStats {
  totalFarmers: number;
  totalBuyers: number;
  totalListings: number;
  totalOffers: number;
  totalRequirements: number;
  pendingVerifications: number;
  pendingComplaints: number;
  totalVolumeListedKg: number;
}
