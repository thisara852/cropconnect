import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';
import {
  AdminFarmerUser,
  AdminBuyerUser,
  MarketPriceRecord,
  AdminComplaint,
  PlatformAnnouncement,
  PlatformStats,
  UserAccountStatus,
  BuyerVerificationStatus,
  ComplaintStatus,
} from '../types/admin';
import { CropListing, BuyerOffer } from '../types/farmer';
import { PurchaseRequirement } from '../types/buyer';

const STORAGE_KEYS = {
  FARMERS: '@cropconnect_admin_farmers_v1',
  BUYERS: '@cropconnect_admin_buyers_v1',
  CROPS: '@cropconnect_farmer_crops_v1',
  OFFERS: '@cropconnect_farmer_offers_v1',
  REQUIREMENTS: '@cropconnect_buyer_requirements_v1',
  PRICES: '@cropconnect_admin_prices_v1',
  COMPLAINTS: '@cropconnect_admin_complaints_v1',
  ANNOUNCEMENTS: '@cropconnect_admin_announcements_v1',
};

// Realistic Sri Lankan Initial Data
const INITIAL_FARMERS: AdminFarmerUser[] = [
  {
    id: 'farmer_001',
    name: 'Bandara Dissanayake',
    email: 'bandara.d@cropconnect.lk',
    phone: '+94 77 452 1892',
    district: 'Dambulla',
    village: 'Galewela',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    registrationDate: '2026-01-15',
    status: 'Active',
    listingsCount: 4,
    totalSoldKg: 18500,
    rating: 4.8,
  },
  {
    id: 'farmer_002',
    name: 'Chaminda Senanayake',
    email: 'chaminda.s@cropconnect.lk',
    phone: '+94 71 832 9941',
    district: 'Anuradhapura',
    village: 'Eppawala',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    registrationDate: '2026-02-10',
    status: 'Active',
    listingsCount: 3,
    totalSoldKg: 14200,
    rating: 4.6,
  },
  {
    id: 'farmer_003',
    name: 'Sarath Kumara',
    email: 'sarath.k@cropconnect.lk',
    phone: '+94 76 910 3345',
    district: 'Nuwara Eliya',
    village: 'Kandapola',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    registrationDate: '2026-02-18',
    status: 'Active',
    listingsCount: 5,
    totalSoldKg: 22000,
    rating: 4.9,
  },
  {
    id: 'farmer_004',
    name: 'Nihal Gunawardena',
    email: 'nihal.g@cropconnect.lk',
    phone: '+94 77 341 0022',
    district: 'Badulla',
    village: 'Bandarawela',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    registrationDate: '2026-03-01',
    status: 'Active',
    listingsCount: 2,
    totalSoldKg: 8900,
    rating: 4.4,
  },
  {
    id: 'farmer_005',
    name: 'K. Sivagnanam',
    email: 'sivagnanam.k@cropconnect.lk',
    phone: '+94 75 220 9182',
    district: 'Jaffna',
    village: 'Chavakachcheri',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    registrationDate: '2026-03-12',
    status: 'Active',
    listingsCount: 3,
    totalSoldKg: 11400,
    rating: 4.7,
  },
  {
    id: 'farmer_006',
    name: 'Sunil Weerakkody',
    email: 'sunil.w@cropconnect.lk',
    phone: '+94 72 665 1190',
    district: 'Kurunegala',
    village: 'Wariyapola',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    registrationDate: '2026-03-25',
    status: 'Suspended',
    listingsCount: 0,
    totalSoldKg: 3200,
    rating: 3.1,
  },
];

const INITIAL_BUYERS: AdminBuyerUser[] = [
  {
    id: 'user_buyer_001',
    businessName: 'Lanka Fresh Supermarkets Ltd',
    ownerName: 'Sunil Perera',
    email: 'buyer@cropconnect.lk',
    phone: '+94 77 123 4567',
    district: 'Colombo',
    businessAddress: 'No 45, Baseline Road, Colombo 09',
    businessType: 'Supermarket Chain / Retailer',
    registrationDate: '2026-01-20',
    verificationStatus: 'Verified',
    brnNumber: 'PV-94812/2022',
    documentsSubmitted: 'BRN Certificate, Tax Clearance, Health Inspector Approval',
    offersCount: 12,
    requirementsCount: 3,
  },
  {
    id: 'buyer_002',
    businessName: 'Dambulla Agro Wholesale Exchange',
    ownerName: 'P. Wickramasinghe',
    email: 'dambulla.wholesale@cropconnect.lk',
    phone: '+94 71 554 9912',
    district: 'Matale',
    businessAddress: 'Shop 14, Dedicated Economic Centre, Dambulla',
    businessType: 'Wholesale Distributor',
    registrationDate: '2026-02-05',
    verificationStatus: 'Verified',
    brnNumber: 'WC-44910/2019',
    documentsSubmitted: 'Economic Center Stall License, Wholesale BRN',
    offersCount: 28,
    requirementsCount: 6,
  },
  {
    id: 'buyer_003',
    businessName: 'Ceylon Organic Exporters Pvt Ltd',
    ownerName: 'Dilshan Fernando',
    email: 'dilshan@ceylonorganic.lk',
    phone: '+94 76 881 2345',
    district: 'Gampaha',
    businessAddress: 'Export Processing Zone, Biyagama',
    businessType: 'Food Exporter',
    registrationDate: '2026-03-10',
    verificationStatus: 'Pending',
    brnNumber: 'PV-118492/2024',
    documentsSubmitted: 'Export Development Board (EDB) License, BRN Copy',
    offersCount: 2,
    requirementsCount: 2,
  },
  {
    id: 'buyer_004',
    businessName: 'Ruhuna Agri Food Processors',
    ownerName: 'Kamal Jayasuriya',
    email: 'kamal.j@ruhunaagri.lk',
    phone: '+94 77 990 4321',
    district: 'Hambantota',
    businessAddress: 'Industrial Zone, Mirijjawila, Hambantota',
    businessType: 'Food Processor & Canning',
    registrationDate: '2026-03-14',
    verificationStatus: 'Pending',
    brnNumber: 'SP-88310/2023',
    documentsSubmitted: 'Factory Registration, Environmental Clearance',
    offersCount: 1,
    requirementsCount: 1,
  },
  {
    id: 'buyer_005',
    businessName: 'Central Highland Green Grocers',
    ownerName: 'Anura Seneviratne',
    email: 'anura.s@highlandgreens.lk',
    phone: '+94 81 223 9980',
    district: 'Kandy',
    businessAddress: 'No 12, William Gopallawa Mawatha, Kandy',
    businessType: 'Restaurant Supplier',
    registrationDate: '2026-02-28',
    verificationStatus: 'Rejected',
    brnNumber: 'CP-19021/2021',
    documentsSubmitted: 'Invalid BRN submitted; expired business registration',
    offersCount: 0,
    requirementsCount: 0,
  },
];

const INITIAL_PRICES: MarketPriceRecord[] = [
  {
    id: 'price_001',
    cropName: 'Big Onions (Dambulla Red)',
    category: 'Vegetables',
    district: 'Dambulla',
    minPricePerKg: 240,
    avgPricePerKg: 275,
    maxPricePerKg: 310,
    recordedDate: '2026-03-28',
    sourceReference: 'Dambulla Dedicated Economic Centre Bulletin',
    isVerifiedGovt: true,
  },
  {
    id: 'price_002',
    cropName: 'Upcountry Carrots',
    category: 'Vegetables',
    district: 'Nuwara Eliya',
    minPricePerKg: 180,
    avgPricePerKg: 210,
    maxPricePerKg: 240,
    recordedDate: '2026-03-28',
    sourceReference: 'Hector Kobbekaduwa Agrarian Research (HARTI)',
    isVerifiedGovt: true,
  },
  {
    id: 'price_003',
    cropName: 'Jaffna Red Onions',
    category: 'Vegetables',
    district: 'Jaffna',
    minPricePerKg: 320,
    avgPricePerKg: 350,
    maxPricePerKg: 390,
    recordedDate: '2026-03-27',
    sourceReference: 'Northern Province Agricultural Extension Service',
    isVerifiedGovt: true,
  },
  {
    id: 'price_004',
    cropName: 'Green Chillies',
    category: 'Vegetables',
    district: 'Dambulla',
    minPricePerKg: 380,
    avgPricePerKg: 420,
    maxPricePerKg: 480,
    recordedDate: '2026-03-28',
    sourceReference: 'Dambulla Dedicated Economic Centre Bulletin',
    isVerifiedGovt: true,
  },
  {
    id: 'price_005',
    cropName: 'Nuwara Eliya Potatoes',
    category: 'Tubers & Roots',
    district: 'Nuwara Eliya',
    minPricePerKg: 260,
    avgPricePerKg: 290,
    maxPricePerKg: 320,
    recordedDate: '2026-03-26',
    sourceReference: 'Department of Agriculture (Peradeniya)',
    isVerifiedGovt: true,
  },
  {
    id: 'price_006',
    cropName: 'Black Pepper Grade 1',
    category: 'Spices',
    district: 'Matale',
    minPricePerKg: 1850,
    avgPricePerKg: 2100,
    maxPricePerKg: 2400,
    recordedDate: '2026-03-25',
    sourceReference: 'Department of Export Agriculture Bulletin',
    isVerifiedGovt: true,
  },
  {
    id: 'price_007',
    cropName: 'Red Lady Papaya',
    category: 'Fruits',
    district: 'Anuradhapura',
    minPricePerKg: 110,
    avgPricePerKg: 135,
    maxPricePerKg: 160,
    recordedDate: '2026-03-27',
    sourceReference: 'Local Market Surveillance Committee',
    isVerifiedGovt: false,
  },
];

const INITIAL_COMPLAINTS: AdminComplaint[] = [
  {
    id: 'cmp_001',
    ticketNumber: 'CMP-2026-8821',
    submittedByName: 'Lanka Fresh Supermarkets Ltd',
    submittedByPhone: '+94 77 123 4567',
    userRole: 'buyer',
    category: 'Quality Dispute',
    subject: 'Moisture content exceeds Grade-1 threshold for Big Onions',
    description:
      'Lot delivered from Galewela had approximately 14% damaged onions due to unseasonal rain harvest. Requesting mediation with farmer for a 10% counter adjustment.',
    submittedDate: '2026-03-26',
    status: 'Under Review',
    adminResponse: 'Agricultural officer dispatched to inspect the sample at Colombo Depot.',
  },
  {
    id: 'cmp_002',
    ticketNumber: 'CMP-2026-8822',
    submittedByName: 'Sarath Kumara',
    submittedByPhone: '+94 76 910 3345',
    userRole: 'farmer',
    category: 'Logistics Delay',
    subject: 'Buyer delayed scheduled pickup by 48 hours',
    description:
      'Carrot harvest was harvested on March 20th as agreed, but buyer transport lorry arrived 2 days late without prior notice.',
    submittedDate: '2026-03-22',
    status: 'Resolved',
    adminResponse: 'Buyer issued formal apology and compensated farmer LKR 15,000 for storage holding costs.',
    resolvedDate: '2026-03-24',
  },
  {
    id: 'cmp_003',
    ticketNumber: 'CMP-2026-8823',
    submittedByName: 'Dilshan Fernando (Ceylon Organic)',
    submittedByPhone: '+94 76 881 2345',
    userRole: 'buyer',
    category: 'Account & Identity',
    subject: 'Buyer verification review taking longer than 48 hours',
    description:
      'We submitted our EDB Export license 4 business days ago. We have urgent export containers to fill and need verified status to bid.',
    submittedDate: '2026-03-27',
    status: 'Pending',
  },
];

const INITIAL_ANNOUNCEMENTS: PlatformAnnouncement[] = [
  {
    id: 'anc_001',
    title: 'Maha Season 2026 Fertilizer & Fuel Subsidy Registration',
    message:
      'All registered farmers in Dambulla, Anuradhapura, and Polonnaruwa can verify their quota via the Department of Agrarian Development starting April 1st.',
    targetAudience: 'Farmers',
    publishedDate: '2026-03-25',
    priority: 'High',
    authorName: 'Director General of Agriculture',
    isActive: true,
  },
  {
    id: 'anc_002',
    title: 'Emergency Distress Crop Rescue Hotline Activated',
    message:
      'Heavy rainfall warning issued for Upcountry. Farmers with standing vegetable crops at risk of flash flooding can flag lots as "Rescue Alert" for priority fast-tracked wholesale bidding.',
    targetAudience: 'All Users',
    publishedDate: '2026-03-27',
    priority: 'Urgent',
    authorName: 'National Disaster Relief & Agri Coordination',
    isActive: true,
  },
  {
    id: 'anc_003',
    title: 'Mandatory BRN Re-Verification for Bulk Exporters',
    message:
      'In accordance with Ministry Circular 2026/04, all buyers transacting over 10,000 kg monthly must maintain active verified status on CROPCONNECT.',
    targetAudience: 'Buyers',
    publishedDate: '2026-03-20',
    priority: 'Normal',
    authorName: 'Market Regulatory Unit',
    isActive: true,
  },
];

export const adminService = {
  // --- STATS OVERVIEW ---
  async getPlatformStats(): Promise<PlatformStats> {
    const [farmers, buyers, crops, offers, reqs, complaints] = await Promise.all([
      this.getFarmers(),
      this.getBuyers(),
      this.getCrops(),
      this.getOffers(),
      this.getRequirements(),
      this.getComplaints(),
    ]);

    const pendingVerifs = buyers.filter((b) => b.verificationStatus === 'Pending').length;
    const pendingCmps = complaints.filter((c) => c.status === 'Pending' || c.status === 'Under Review').length;
    const totalVolume = crops.reduce((acc, c) => acc + (c.quantityKg || 0), 0);

    return {
      totalFarmers: farmers.length,
      totalBuyers: buyers.length,
      totalListings: crops.length,
      totalOffers: offers.length,
      totalRequirements: reqs.length,
      pendingVerifications: pendingVerifs,
      pendingComplaints: pendingCmps,
      totalVolumeListedKg: totalVolume,
    };
  },

  // --- FARMERS MANAGEMENT ---
  async getFarmers(): Promise<AdminFarmerUser[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FARMERS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(INITIAL_FARMERS));
      return INITIAL_FARMERS;
    } catch {
      return INITIAL_FARMERS;
    }
  },

  async updateFarmerStatus(farmerId: string, status: UserAccountStatus): Promise<AdminFarmerUser | null> {
    const list = await this.getFarmers();
    const idx = list.findIndex((f) => f.id === farmerId);
    if (idx === -1) return null;
    list[idx].status = status;
    await AsyncStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(list));
    return list[idx];
  },

  async updateFarmer(farmerId: string, updates: Partial<AdminFarmerUser>): Promise<AdminFarmerUser | null> {
    const list = await this.getFarmers();
    const idx = list.findIndex((f) => f.id === farmerId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(list));
    return list[idx];
  },

  // --- BUYERS MANAGEMENT ---
  async getBuyers(): Promise<AdminBuyerUser[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BUYERS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(INITIAL_BUYERS));
      return INITIAL_BUYERS;
    } catch {
      return INITIAL_BUYERS;
    }
  },

  async updateBuyerVerification(
    buyerId: string,
    status: BuyerVerificationStatus
  ): Promise<AdminBuyerUser | null> {
    const list = await this.getBuyers();
    const idx = list.findIndex((b) => b.id === buyerId);
    if (idx === -1) return null;
    list[idx].verificationStatus = status;
    await AsyncStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(list));

    // Dispatch real-time notification
    notificationService.dispatchNotification(
      'buyer_verified',
      `Corporate Verification Update: ${status}`,
      `Your commercial buying authorization has been updated to ${status} by Platform Compliance.`,
      '/(buyer)/profile',
      { recipientId: buyerId }
    );

    return list[idx];
  },

  async updateBuyer(buyerId: string, updates: Partial<AdminBuyerUser>): Promise<AdminBuyerUser | null> {
    const list = await this.getBuyers();
    const idx = list.findIndex((b) => b.id === buyerId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(list));
    return list[idx];
  },

  // --- CROPS MANAGEMENT (Shared with Farmer & Buyer) ---
  async getCrops(): Promise<CropListing[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CROPS);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  },

  async updateCropStatus(cropId: string, status: CropListing['status']): Promise<boolean> {
    const crops = await this.getCrops();
    const idx = crops.findIndex((c) => c.id === cropId);
    if (idx === -1) return false;
    crops[idx].status = status;
    await AsyncStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(crops));
    return true;
  },

  async removeCropListing(cropId: string): Promise<boolean> {
    const crops = await this.getCrops();
    const updated = crops.filter((c) => c.id !== cropId);
    await AsyncStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(updated));
    return true;
  },

  // --- OFFERS MONITORING (Read-only audit, non-tampering) ---
  async getOffers(): Promise<BuyerOffer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFERS);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  },

  // --- REQUIREMENTS MONITORING ---
  async getRequirements(): Promise<PurchaseRequirement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REQUIREMENTS);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  },

  // --- MARKET PRICE MANAGEMENT ---
  async getPrices(): Promise<MarketPriceRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRICES);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(INITIAL_PRICES));
      return INITIAL_PRICES;
    } catch {
      return INITIAL_PRICES;
    }
  },

  async addPrice(price: Omit<MarketPriceRecord, 'id'>): Promise<MarketPriceRecord> {
    const prices = await this.getPrices();
    const newRecord: MarketPriceRecord = {
      ...price,
      id: `price_${Date.now()}`,
    };
    const updated = [newRecord, ...prices];
    await AsyncStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(updated));
    return newRecord;
  },

  async updatePrice(id: string, updates: Partial<MarketPriceRecord>): Promise<MarketPriceRecord | null> {
    const prices = await this.getPrices();
    const idx = prices.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    prices[idx] = { ...prices[idx], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(prices));
    return prices[idx];
  },

  async deletePrice(id: string): Promise<boolean> {
    const prices = await this.getPrices();
    const updated = prices.filter((p) => p.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(updated));
    return true;
  },

  // --- COMPLAINTS MANAGEMENT ---
  async getComplaints(): Promise<AdminComplaint[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    } catch {
      return INITIAL_COMPLAINTS;
    }
  },

  async updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    adminResponse?: string
  ): Promise<AdminComplaint | null> {
    const complaints = await this.getComplaints();
    const idx = complaints.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    complaints[idx].status = status;
    if (adminResponse !== undefined) {
      complaints[idx].adminResponse = adminResponse;
    }
    if (status === 'Resolved') {
      complaints[idx].resolvedDate = new Date().toISOString().split('T')[0];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    return complaints[idx];
  },

  // --- ANNOUNCEMENTS MANAGEMENT ---
  async getAnnouncements(): Promise<PlatformAnnouncement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  },

  async createAnnouncement(data: Omit<PlatformAnnouncement, 'id'>): Promise<PlatformAnnouncement> {
    const list = await this.getAnnouncements();
    const newAnc: PlatformAnnouncement = {
      ...data,
      id: `anc_${Date.now()}`,
    };
    const updated = [newAnc, ...list];
    await AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));

    // Dispatch broadcast notification
    notificationService.dispatchNotification(
      'admin_announcement',
      data.title,
      data.message,
      undefined,
      { audience: data.targetAudience }
    );

    return newAnc;
  },

  async updateAnnouncement(
    id: string,
    updates: Partial<PlatformAnnouncement>
  ): Promise<PlatformAnnouncement | null> {
    const list = await this.getAnnouncements();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    return list[idx];
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    const list = await this.getAnnouncements();
    const updated = list.filter((a) => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    return true;
  },
};
