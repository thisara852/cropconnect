import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';
import {
  CropListing,
  BuyerLead,
  BuyerOffer,
  AIFairPricePrediction,
  PriceHistoryPoint,
  FarmerNotification,
} from '../types/farmer';

const STORAGE_KEYS = {
  CROPS: '@cropconnect_farmer_crops_v1',
  OFFERS: '@cropconnect_farmer_offers_v1',
  NOTIFICATIONS: '@cropconnect_farmer_notifications_v1',
};

// Initial realistic Sri Lankan crop listings for the farmer
const INITIAL_CROPS: CropListing[] = [
  {
    id: 'crop_001',
    farmerId: 'user_farmer_001',
    farmerName: 'Sunil Bandara',
    farmerPhone: '0771234567',
    cropName: 'Big Onion (ලොකු ළූණු)',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80',
    quantityKg: 3500,
    pricePerKg: 280,
    harvestDate: '2026-11-20',
    district: 'Anuradhapura',
    village: 'Thambuttegama, Track 4',
    description:
      'High grade, cured Anuradhapura Big Onions. Stored in airy ventilated sheds. Uniform medium to large bulb size, ready for wholesale dispatch.',
    status: 'Active',
    createdAt: '2026-11-21T08:30:00.000Z',
    viewsCount: 142,
    offersCount: 3,
    isRescue: false,
  },
  {
    id: 'crop_002',
    farmerId: 'user_farmer_001',
    farmerName: 'Sunil Bandara',
    farmerPhone: '0771234567',
    cropName: 'Tomatoes (තක්කාලි)',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
    quantityKg: 1200,
    pricePerKg: 195,
    harvestDate: '2026-11-22',
    district: 'Anuradhapura',
    village: 'Thambuttegama',
    description:
      'Firm ripe cooking tomatoes harvested yesterday morning. Urgent rescue dispatch needed within 48 hours to prevent spoilage.',
    status: 'Rescue Alert',
    createdAt: '2026-11-22T06:15:00.000Z',
    viewsCount: 210,
    offersCount: 2,
    isRescue: true,
  },
  {
    id: 'crop_003',
    farmerId: 'user_farmer_001',
    farmerName: 'Sunil Bandara',
    farmerPhone: '0771234567',
    cropName: 'Green Chillies (අමු මිරිස්)',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80',
    quantityKg: 450,
    pricePerKg: 520,
    harvestDate: '2026-11-18',
    district: 'Anuradhapura',
    village: 'Eppawala',
    description:
      'Spicy fresh green chillies, sorted and packed in breathable 25kg crates. Low moisture content and long shelf life.',
    status: 'Under Offer',
    createdAt: '2026-11-19T10:00:00.000Z',
    viewsCount: 88,
    offersCount: 1,
    isRescue: false,
  },
  {
    id: 'crop_004',
    farmerId: 'user_farmer_001',
    farmerName: 'Sunil Bandara',
    farmerPhone: '0771234567',
    cropName: 'Pumpkin (වට්ටක්කා)',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1570586435893-ab4e7b28451e?w=600&q=80',
    quantityKg: 2000,
    pricePerKg: 130,
    harvestDate: '2026-11-10',
    district: 'Anuradhapura',
    village: 'Galnewa',
    description:
      'Whole sweet pumpkin with thick skin, fully matured on vine. Excellent storage durability for bulk procurement.',
    status: 'Sold',
    createdAt: '2026-11-12T14:20:00.000Z',
    viewsCount: 175,
    offersCount: 4,
    isRescue: false,
  },
];

// Realistic Sri Lankan Buyer Leads
const INITIAL_BUYERS: BuyerLead[] = [
  {
    id: 'buyer_001',
    businessName: 'Lanka Fresh Supermarkets Ltd',
    ownerName: 'Dilshan Perera',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    district: 'Colombo',
    distanceKm: 14.5,
    requiredCrop: 'Big Onion (ලොකු ළූණු)',
    requiredQuantityKg: 5000,
    maxPricePerKg: 290,
    businessType: 'Supermarket / Retail Chain',
    phone: '0719876543',
    email: 'procurement@lankafresh.lk',
    address: 'No. 45, Baseline Road, Colombo 09',
    verified: true,
    rating: 4.9,
    purchasingNotes: 'Immediate payment on delivery inspection. Preferred direct transport to Peliyagoda Cold Store.',
    activeOrdersCount: 12,
  },
  {
    id: 'buyer_002',
    businessName: 'Dambulla Wholesale Produce Consortium',
    ownerName: 'K. M. Navaratne',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
    district: 'Matale',
    distanceKm: 28.0,
    requiredCrop: 'Tomatoes (තක්කාලි)',
    requiredQuantityKg: 3000,
    maxPricePerKg: 205,
    businessType: 'Wholesale Distributor',
    phone: '0662284190',
    email: 'navaratne.veg@dambulla.lk',
    address: 'Stall B-14, Dedicated Economic Centre, Dambulla',
    verified: true,
    rating: 4.8,
    purchasingNotes: 'Looking for prompt rescue harvests. Own fleet of refrigerated trucks available for farm pick-up.',
    activeOrdersCount: 24,
  },
  {
    id: 'buyer_003',
    businessName: 'Ceylon Organics & Pure Harvests',
    ownerName: 'Rashmi Senanayake',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
    district: 'Kandy',
    distanceKm: 52.3,
    requiredCrop: 'Green Chillies (අමු මිරිස්)',
    requiredQuantityKg: 800,
    maxPricePerKg: 540,
    businessType: 'Agricultural Exporter',
    phone: '0812239481',
    email: 'rashmi@ceylonorganics.com',
    address: 'Industrial Zone, Pallekele, Kandy',
    verified: true,
    rating: 4.95,
    purchasingNotes: 'Export grade required. Grade A sorted, zero pesticide residue preferred. Premium paid for freshness.',
    activeOrdersCount: 8,
  },
  {
    id: 'buyer_004',
    businessName: 'Ruhuna Food Processors & Canners',
    ownerName: 'Sunanda Gamage',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    district: 'Galle',
    distanceKm: 85.0,
    requiredCrop: 'Pumpkin (වට්ටක්කා)',
    requiredQuantityKg: 10000,
    maxPricePerKg: 140,
    businessType: 'Food Processing Enterprise',
    phone: '0912233445',
    email: 'sourcing@ruhuna-foods.lk',
    address: 'Karapitiya Road, Galle',
    verified: true,
    rating: 4.7,
    purchasingNotes: 'Bulk canning pulp supply. Minimum lot size 2,000 kg. Long-term contract matching available.',
    activeOrdersCount: 16,
  },
];

// Sample Buyer Offers
const INITIAL_OFFERS: BuyerOffer[] = [
  {
    id: 'offer_001',
    cropListingId: 'crop_001',
    cropName: 'Big Onion (ලොකු ළූණු)',
    buyerId: 'buyer_001',
    buyerName: 'Lanka Fresh Supermarkets Ltd',
    buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    buyerLocation: 'Colombo (Peliyagoda Hub)',
    offeredPricePerKg: 285,
    requestedQuantityKg: 2500,
    totalValueLkr: 712500,
    offerDate: '2026-11-22T14:30:00.000Z',
    status: 'Pending',
    isBestOffer: true,
    buyerPhone: '0719876543',
    notes: 'We can collect directly from your farm store tomorrow at 10 AM. Cash on loading.',
  },
  {
    id: 'offer_002',
    cropListingId: 'crop_001',
    cropName: 'Big Onion (ලොකු ළූණු)',
    buyerId: 'buyer_002',
    buyerName: 'Dambulla Wholesale Produce Consortium',
    buyerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
    buyerLocation: 'Dambulla DEC',
    offeredPricePerKg: 275,
    requestedQuantityKg: 3500,
    totalValueLkr: 962500,
    offerDate: '2026-11-22T11:15:00.000Z',
    status: 'Pending',
    isBestOffer: false,
    buyerPhone: '0662284190',
    notes: 'We will take your entire 3,500 kg batch in one single transaction.',
  },
  {
    id: 'offer_003',
    cropListingId: 'crop_002',
    cropName: 'Tomatoes (තක්කාලි)',
    buyerId: 'buyer_002',
    buyerName: 'Dambulla Wholesale Produce Consortium',
    buyerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
    buyerLocation: 'Dambulla DEC',
    offeredPricePerKg: 200,
    requestedQuantityKg: 1200,
    totalValueLkr: 240000,
    offerDate: '2026-11-23T08:00:00.000Z',
    status: 'Pending',
    isBestOffer: true,
    buyerPhone: '0662284190',
    notes: 'Rescue offer: We dispatch a truck within 3 hours. Will clear entire ripe tomato lot.',
  },
];

// Initial notifications
const INITIAL_NOTIFICATIONS: FarmerNotification[] = [
  {
    id: 'notif_001',
    type: 'offer',
    title: 'New High Offer on Big Onions!',
    message: 'Lanka Fresh Supermarkets offered LKR 285/kg for 2,500kg. Best price currently on market.',
    timestamp: '15 mins ago',
    read: false,
    targetId: 'crop_001',
  },
  {
    id: 'notif_002',
    type: 'enquiry',
    title: 'Urgent Rescue Buyer Match',
    message: 'Dambulla Wholesale Consortium wants to dispatch truck for your 1,200kg Tomatoes.',
    timestamp: '1 hour ago',
    read: false,
    targetId: 'crop_002',
  },
  {
    id: 'notif_003',
    type: 'system',
    title: 'AI Price Forecast Alert',
    message: 'Big Onion wholesale index in Dambulla rose by 8.4% today due to lower northern arrivals.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'notif_004',
    type: 'listing',
    title: 'Listing Marked as Active',
    message: 'Your listing for Green Chillies is now visible to 384 verified commercial buyers.',
    timestamp: '2 days ago',
    read: true,
    targetId: 'crop_003',
  },
];

class FarmerService {
  private crops: CropListing[] = [...INITIAL_CROPS];
  private buyers: BuyerLead[] = [...INITIAL_BUYERS];
  private offers: BuyerOffer[] = [...INITIAL_OFFERS];
  private notifications: FarmerNotification[] = [...INITIAL_NOTIFICATIONS];
  private isLoaded = false;

  private async loadFromStorage() {
    if (this.isLoaded) return;
    try {
      const storedCrops = await AsyncStorage.getItem(STORAGE_KEYS.CROPS);
      if (storedCrops) {
        this.crops = JSON.parse(storedCrops);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(INITIAL_CROPS));
      }

      const storedOffers = await AsyncStorage.getItem(STORAGE_KEYS.OFFERS);
      if (storedOffers) {
        this.offers = JSON.parse(storedOffers);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(INITIAL_OFFERS));
      }

      const storedNotifs = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    } catch {
      // Memory fallback
    }
    this.isLoaded = true;
  }

  // --- CROP LISTINGS ---

  async getCropListings(): Promise<CropListing[]> {
    await this.loadFromStorage();
    return [...this.crops];
  }

  async getCropListingById(id: string): Promise<CropListing | null> {
    await this.loadFromStorage();
    const item = this.crops.find(c => c.id === id);
    return item ? { ...item } : null;
  }

  async addCropListing(data: Omit<CropListing, 'id' | 'createdAt' | 'viewsCount' | 'offersCount'>): Promise<CropListing> {
    await this.loadFromStorage();

    const newCrop: CropListing = {
      ...data,
      id: `crop_${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      offersCount: 0,
    };

    this.crops.unshift(newCrop);
    await AsyncStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(this.crops));

    // Also trigger notification
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'listing',
      title: 'Listing Published Successfully',
      message: `${newCrop.cropName} (${newCrop.quantityKg} kg) is now live and searchable by buyers.`,
      timestamp: 'Just now',
      read: false,
      targetId: newCrop.id,
    });
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));

    return newCrop;
  }

  async updateCropListing(id: string, updates: Partial<CropListing>): Promise<CropListing | null> {
    await this.loadFromStorage();
    const index = this.crops.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.crops[index] = { ...this.crops[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(this.crops));
    return { ...this.crops[index] };
  }

  async deleteCropListing(id: string): Promise<boolean> {
    await this.loadFromStorage();
    const prevLen = this.crops.length;
    this.crops = this.crops.filter(c => c.id !== id);
    // remove offers for this crop too
    this.offers = this.offers.filter(o => o.cropListingId !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(this.crops));
    await AsyncStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(this.offers));
    return this.crops.length < prevLen;
  }

  // --- BUYERS ---

  async getNearbyBuyers(search?: string, district?: string): Promise<BuyerLead[]> {
    await this.loadFromStorage();
    let result = [...this.buyers];

    if (district && district !== 'All') {
      result = result.filter(b => b.district.toLowerCase() === district.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        b =>
          b.businessName.toLowerCase().includes(q) ||
          b.requiredCrop.toLowerCase().includes(q) ||
          b.district.toLowerCase().includes(q)
      );
    }

    return result;
  }

  async getBuyerById(id: string): Promise<BuyerLead | null> {
    await this.loadFromStorage();
    const b = this.buyers.find(item => item.id === id);
    return b ? { ...b } : null;
  }

  // --- BUYER OFFERS ---

  async getOffersForCrop(cropListingId: string): Promise<BuyerOffer[]> {
    await this.loadFromStorage();
    return this.offers.filter(o => o.cropListingId === cropListingId);
  }

  async getAllFarmerOffers(): Promise<BuyerOffer[]> {
    await this.loadFromStorage();
    return [...this.offers];
  }

  async receiveOffer(offer: BuyerOffer): Promise<void> {
    await this.loadFromStorage();
    this.offers.unshift(offer);
    await AsyncStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(this.offers));
  }

  async respondToOffer(offerId: string, decision: 'Accepted' | 'Rejected'): Promise<boolean> {
    await this.loadFromStorage();
    const index = this.offers.findIndex(o => o.id === offerId);
    if (index === -1) return false;

    this.offers[index].status = decision;

    // If accepted, mark the parent crop as "Under Offer" or "Sold"
    if (decision === 'Accepted') {
      const cropId = this.offers[index].cropListingId;
      const cropIndex = this.crops.findIndex(c => c.id === cropId);
      if (cropIndex !== -1) {
        this.crops[cropIndex].status = 'Under Offer';
        await AsyncStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(this.crops));
      }
    }

    await AsyncStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(this.offers));

    // Dispatch shared notification to buyer
    const offerItem = this.offers[index];
    notificationService.dispatchNotification(
      decision === 'Accepted' ? 'offer_accepted' : 'offer_rejected',
      `Offer for ${offerItem.cropName} ${decision}!`,
      `Farmer ${decision === 'Accepted' ? 'accepted' : 'declined'} your offer of LKR ${offerItem.offeredPricePerKg}/kg for ${offerItem.requestedQuantityKg}kg.`,
      '/(buyer)/offers',
      { offerId, buyerId: offerItem.buyerId }
    );

    return true;
  }

  // --- SIMULATED AI FAIR-PRICE PREDICTION ---

  getAIFairPricePrediction(
    cropName: string,
    district: string,
    quantityKg: number = 1000
  ): AIFairPricePrediction {
    // Deterministic price estimation map for Sri Lankan markets
    const basePrices: Record<string, number> = {
      'Big Onion': 280,
      'Tomatoes': 210,
      'Carrots': 320,
      'Green Chillies': 540,
      'Potatoes': 390,
      'Pumpkin': 135,
      'Cabbage': 160,
      'Leeks': 240,
      'Paddy / Rice': 145,
      'Papaya': 110,
      'Bananas / Ambul': 180,
      'Ceylon Cinnamon': 2900,
      'Brinjal / Eggplant': 220,
      'Green Beans': 290,
    };

    // Find closest key
    let base = 220;
    for (const key of Object.keys(basePrices)) {
      if (cropName.toLowerCase().includes(key.toLowerCase())) {
        base = basePrices[key];
        break;
      }
    }

    // District transport factor
    let distMultiplier = 1.0;
    if (['Colombo', 'Gampaha'].includes(district)) distMultiplier = 1.08;
    else if (['Nuwara Eliya', 'Matale'].includes(district)) distMultiplier = 0.98;
    else if (['Jaffna', 'Batticaloa'].includes(district)) distMultiplier = 1.04;

    // Quantity scale factor (bulk vs small)
    const scaleFactor = quantityKg > 2000 ? 0.96 : 1.0;

    const predicted = Math.round(base * distMultiplier * scaleFactor);
    const minPrice = Math.round(predicted * 0.88);
    const maxPrice = Math.round(predicted * 1.14);

    return {
      cropName,
      district: district || 'Anuradhapura',
      predictedPricePerKg: predicted,
      minPricePerKg: minPrice,
      maxPricePerKg: maxPrice,
      confidenceScore: 94.6,
      dambullaWholesalePrice: Math.round(predicted * 0.95),
      pettahWholesalePrice: Math.round(predicted * 1.06),
      meegodaWholesalePrice: Math.round(predicted * 1.02),
      trend: predicted > 250 ? 'up' : 'stable',
      trendPercent: 6.2,
      explanation:
        'Predicted fair-farmgate price benchmarks 14-day rolling transactions across Dambulla and Manning Market economic centers, weighted by current seasonal yield and regional transport indices.',
      factors: [
        {
          name: 'Regional Supply Volume',
          impact: quantityKg > 3000 ? 'negative' : 'neutral',
          text: 'Mid-season harvest arrival is healthy in North-Central dry zone.',
        },
        {
          name: 'Commercial Wholesale Demand',
          impact: 'positive',
          text: 'Supermarket and wholesale buyers are actively procuring buffer stocks.',
        },
        {
          name: 'Inter-district Transport Cost',
          impact: 'positive',
          text: 'Fuel and logistics costs currently add ~LKR 12-18/kg to terminal market deliveries.',
        },
      ],
    };
  }

  // --- PRICE HISTORY ---

  getPriceHistory(cropName: string, timeframe: 'daily' | 'weekly' | 'monthly'): PriceHistoryPoint[] {
    let base = 240;
    if (cropName.includes('Onion')) base = 280;
    else if (cropName.includes('Tomato')) base = 195;
    else if (cropName.includes('Chilli')) base = 520;
    else if (cropName.includes('Carrot')) base = 310;
    else if (cropName.includes('Potato')) base = 380;

    if (timeframe === 'daily') {
      return [
        { date: '17 Nov', label: 'Mon', price: Math.round(base * 0.92), volumeKg: 4200 },
        { date: '18 Nov', label: 'Tue', price: Math.round(base * 0.95), volumeKg: 3800 },
        { date: '19 Nov', label: 'Wed', price: Math.round(base * 0.94), volumeKg: 5100 },
        { date: '20 Nov', label: 'Thu', price: Math.round(base * 0.99), volumeKg: 4600 },
        { date: '21 Nov', label: 'Fri', price: Math.round(base * 1.02), volumeKg: 6200 },
        { date: '22 Nov', label: 'Sat', price: Math.round(base * 1.05), volumeKg: 7800 },
        { date: '23 Nov', label: 'Today', price: Math.round(base * 1.03), volumeKg: 5900 },
      ];
    } else if (timeframe === 'weekly') {
      return [
        { date: 'Week 1', label: 'W1', price: Math.round(base * 0.88), volumeKg: 18000 },
        { date: 'Week 2', label: 'W2', price: Math.round(base * 0.93), volumeKg: 22000 },
        { date: 'Week 3', label: 'W3', price: Math.round(base * 0.98), volumeKg: 26000 },
        { date: 'Week 4', label: 'W4 (Current)', price: Math.round(base * 1.03), volumeKg: 29000 },
      ];
    } else {
      return [
        { date: 'Jun', label: 'Jun', price: Math.round(base * 0.82) },
        { date: 'Jul', label: 'Jul', price: Math.round(base * 0.86) },
        { date: 'Aug', label: 'Aug', price: Math.round(base * 0.91) },
        { date: 'Sep', label: 'Sep', price: Math.round(base * 0.96) },
        { date: 'Oct', label: 'Oct', price: Math.round(base * 1.01) },
        { date: 'Nov', label: 'Nov', price: Math.round(base * 1.04) },
      ];
    }
  }

  // --- NOTIFICATIONS ---

  async getNotifications(): Promise<FarmerNotification[]> {
    await this.loadFromStorage();
    return [...this.notifications];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.loadFromStorage();
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    }
  }

  async sendBuyerEnquiry(buyerId: string, message: string, cropName: string): Promise<boolean> {
    await this.loadFromStorage();
    // Simulate outgoing enquiry
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'enquiry',
      title: 'Enquiry Dispatched to Buyer',
      message: `Your message regarding ${cropName} was sent to ${buyerId}.`,
      timestamp: 'Just now',
      read: false,
    });
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    return true;
  }
}

export const farmerService = new FarmerService();
