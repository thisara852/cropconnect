import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';
import { CropListing, BuyerOffer } from '../types/farmer';
import { PurchaseRequirement, FarmerLead, BuyerNotification, OfferStatus } from '../types/buyer';
import { farmerService } from './farmerService';

const SHARED_STORAGE_KEYS = {
  CROPS: '@cropconnect_farmer_crops_v1',
  OFFERS: '@cropconnect_farmer_offers_v1',
  REQUIREMENTS: '@cropconnect_buyer_requirements_v1',
  SAVED_CROPS: '@cropconnect_buyer_saved_v1',
  NOTIFICATIONS: '@cropconnect_buyer_notifications_v1',
};

// Initial realistic Sri Lankan Buyer Purchase Requirements
const INITIAL_REQUIREMENTS: PurchaseRequirement[] = [
  {
    id: 'req_001',
    buyerId: 'user_buyer_001',
    buyerName: 'Lanka Fresh Supermarkets Ltd',
    cropName: 'Big Onion (ලොකු ළූණු)',
    category: 'Vegetables',
    quantityKg: 5000,
    targetPricePerKg: 285,
    preferredDistrict: 'Anuradhapura',
    requiredDate: '2026-11-28',
    additionalNotes: 'Need cured, graded big onions for central Peliyagoda warehouse. Transport can be arranged.',
    contactPhone: '0719876543',
    status: 'Active',
    createdAt: '2026-11-21T10:00:00.000Z',
  },
  {
    id: 'req_002',
    buyerId: 'user_buyer_001',
    buyerName: 'Lanka Fresh Supermarkets Ltd',
    cropName: 'Carrots (කැරට්)',
    category: 'Vegetables',
    quantityKg: 2500,
    targetPricePerKg: 310,
    preferredDistrict: 'Nuwara Eliya',
    requiredDate: '2026-11-29',
    additionalNotes: 'Washed and sorted Grade A carrots. Prefer weekly recurring delivery contracts.',
    contactPhone: '0719876543',
    status: 'Active',
    createdAt: '2026-11-22T08:30:00.000Z',
  },
  {
    id: 'req_003',
    buyerId: 'user_buyer_001',
    buyerName: 'Lanka Fresh Supermarkets Ltd',
    cropName: 'Green Chillies (අමු මිරිස්)',
    category: 'Vegetables',
    quantityKg: 800,
    targetPricePerKg: 530,
    preferredDistrict: 'Matale',
    requiredDate: '2026-11-26',
    additionalNotes: 'Freshly harvested green chillies in breathable crates.',
    contactPhone: '0719876543',
    status: 'Fulfilled',
    createdAt: '2026-11-18T14:00:00.000Z',
  },
];

// Realistic Sri Lankan Farmer Directory
const INITIAL_FARMERS: FarmerLead[] = [
  {
    id: 'user_farmer_001',
    name: 'Sunil Bandara',
    avatarUrl: 'https://images.unsplash.com/photo-1595956553066-fe24a8c33395?w=200&q=80',
    phone: '0771234567',
    district: 'Anuradhapura',
    village: 'Thambuttegama Track 4',
    bio: 'Paddy and vegetable grower with 5 acres in Mahaweli System H. Specializes in cured Big Onions, Tomatoes, and Green Chillies.',
    rating: 4.9,
    activeListingsCount: 3,
    cropsOffered: ['Big Onion', 'Tomatoes', 'Green Chillies', 'Pumpkin'],
    totalHarvestSoldKg: 18500,
  },
  {
    id: 'user_farmer_002',
    name: 'Kamal Wickramasinghe',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    phone: '0723456789',
    district: 'Nuwara Eliya',
    village: 'Kandapola, High Valley',
    bio: 'Upcountry vegetable producer. Cultivating Grade A Carrots, Leeks, Cabbage, and Beetroot with modern sprinkler irrigation.',
    rating: 4.85,
    activeListingsCount: 4,
    cropsOffered: ['Carrots', 'Leeks', 'Cabbage', 'Potatoes'],
    totalHarvestSoldKg: 24000,
  },
  {
    id: 'user_farmer_003',
    name: 'Nimal Jayasuriya',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    phone: '0765554321',
    district: 'Matale',
    village: 'Dambulla North',
    bio: 'Commercial fruit and vegetable supplier located 5km from Dambulla Economic Centre. Guaranteed prompt dispatch logistics.',
    rating: 4.95,
    activeListingsCount: 2,
    cropsOffered: ['Papaya', 'Tomatoes', 'Bananas', 'Green Beans'],
    totalHarvestSoldKg: 32000,
  },
  {
    id: 'user_farmer_004',
    name: 'Sarath Kumara',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    phone: '0789887766',
    district: 'Ratnapura',
    village: 'Embilipitiya, Block B',
    bio: 'Banana & Papaya plantation manager. Supply certified Ambul and Cavendish banana varieties ready for wholesale crates.',
    rating: 4.75,
    activeListingsCount: 2,
    cropsOffered: ['Bananas / Ambul', 'Papaya', 'Pumpkin'],
    totalHarvestSoldKg: 14500,
  },
];

// Initial Buyer Notifications
const INITIAL_BUYER_NOTIFICATIONS: BuyerNotification[] = [
  {
    id: 'bnotif_001',
    type: 'offer_accepted',
    title: 'Offer Accepted by Farmer Sunil!',
    message: 'Sunil Bandara accepted your offer of LKR 285/kg for 2,500kg Big Onions. View dispatch instructions.',
    timestamp: '20 mins ago',
    read: false,
    targetId: 'crop_001',
  },
  {
    id: 'bnotif_002',
    type: 'crop_match',
    title: 'Urgent Rescue Match Available',
    message: '1,200kg fresh cooking Tomatoes listed under Rescue Alert in Anuradhapura at LKR 195/kg.',
    timestamp: '1 hour ago',
    read: false,
    targetId: 'crop_002',
  },
  {
    id: 'bnotif_003',
    type: 'requirement_update',
    title: 'New Matching Harvest for Carrots',
    message: 'Kamal Wickramasinghe in Nuwara Eliya posted a 2,500kg Carrot lot matching your active requirement.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'bnotif_004',
    type: 'announcement',
    title: 'Dambulla Market Price Intelligence',
    message: 'Average terminal prices for root vegetables stabilized. Optimal sourcing timeframe.',
    timestamp: '2 days ago',
    read: true,
  },
];

class BuyerService {
  private requirements: PurchaseRequirement[] = [...INITIAL_REQUIREMENTS];
  private savedCropIds: string[] = ['crop_001', 'crop_003'];
  private notifications: BuyerNotification[] = [...INITIAL_BUYER_NOTIFICATIONS];
  private farmers: FarmerLead[] = [...INITIAL_FARMERS];
  private isLoaded = false;

  private async loadFromStorage() {
    if (this.isLoaded) return;
    try {
      const storedReqs = await AsyncStorage.getItem(SHARED_STORAGE_KEYS.REQUIREMENTS);
      if (storedReqs) {
        this.requirements = JSON.parse(storedReqs);
      } else {
        await AsyncStorage.setItem(SHARED_STORAGE_KEYS.REQUIREMENTS, JSON.stringify(INITIAL_REQUIREMENTS));
      }

      const storedSaved = await AsyncStorage.getItem(SHARED_STORAGE_KEYS.SAVED_CROPS);
      if (storedSaved) {
        this.savedCropIds = JSON.parse(storedSaved);
      } else {
        await AsyncStorage.setItem(SHARED_STORAGE_KEYS.SAVED_CROPS, JSON.stringify(this.savedCropIds));
      }

      const storedNotifs = await AsyncStorage.getItem(SHARED_STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        await AsyncStorage.setItem(SHARED_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_BUYER_NOTIFICATIONS));
      }
    } catch {
      // Fallback
    }
    this.isLoaded = true;
  }

  // --- CROPS (Shared with Farmer Module) ---

  async getAllAvailableCrops(): Promise<CropListing[]> {
    // Get live crops from shared farmer service
    return farmerService.getCropListings();
  }

  async getCropById(id: string): Promise<CropListing | null> {
    return farmerService.getCropListingById(id);
  }

  // --- SAVED / BOOKMARKED CROPS ---

  async getSavedCropIds(): Promise<string[]> {
    await this.loadFromStorage();
    return [...this.savedCropIds];
  }

  async toggleSaveCrop(cropId: string): Promise<boolean> {
    await this.loadFromStorage();
    const index = this.savedCropIds.indexOf(cropId);
    let isNowSaved = false;
    if (index !== -1) {
      this.savedCropIds.splice(index, 1);
      isNowSaved = false;
    } else {
      this.savedCropIds.push(cropId);
      isNowSaved = true;
    }
    await AsyncStorage.setItem(SHARED_STORAGE_KEYS.SAVED_CROPS, JSON.stringify(this.savedCropIds));
    return isNowSaved;
  }

  async getSavedCrops(): Promise<CropListing[]> {
    await this.loadFromStorage();
    const allCrops = await farmerService.getCropListings();
    return allCrops.filter(c => this.savedCropIds.includes(c.id));
  }

  // --- OFFERS (Shared with Farmer Module) ---

  async getBuyerOffers(buyerId: string = 'user_buyer_001'): Promise<BuyerOffer[]> {
    // Retrieves offers from the shared offers storage!
    const allOffers = await farmerService.getAllFarmerOffers();
    return allOffers.filter(o => o.buyerId === buyerId);
  }

  async submitOffer(offerData: {
    cropListingId: string;
    cropName: string;
    buyerId: string;
    buyerName: string;
    buyerAvatar?: string;
    buyerLocation: string;
    buyerPhone: string;
    offeredPricePerKg: number;
    requestedQuantityKg: number;
    collectionDate?: string;
    notes?: string;
  }): Promise<BuyerOffer> {
    await this.loadFromStorage();

    const totalValueLkr = Math.round(offerData.offeredPricePerKg * offerData.requestedQuantityKg);

    const newOffer: BuyerOffer = {
      id: `offer_${Date.now()}`,
      cropListingId: offerData.cropListingId,
      cropName: offerData.cropName,
      buyerId: offerData.buyerId,
      buyerName: offerData.buyerName,
      buyerAvatar: offerData.buyerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      buyerLocation: offerData.buyerLocation,
      buyerPhone: offerData.buyerPhone,
      offeredPricePerKg: offerData.offeredPricePerKg,
      requestedQuantityKg: offerData.requestedQuantityKg,
      totalValueLkr,
      offerDate: new Date().toISOString(),
      status: 'Pending',
      notes: offerData.notes,
    };

    // Push into shared offers storage
    try {
      const storedOffersJson = await AsyncStorage.getItem(SHARED_STORAGE_KEYS.OFFERS);
      const offersList: BuyerOffer[] = storedOffersJson ? JSON.parse(storedOffersJson) : [];
      offersList.unshift(newOffer);
      await AsyncStorage.setItem(SHARED_STORAGE_KEYS.OFFERS, JSON.stringify(offersList));

      // Update offer count on the crop in shared storage
      const cropsList = await farmerService.getCropListings();
      const targetCropIndex = cropsList.findIndex(c => c.id === offerData.cropListingId);
      if (targetCropIndex !== -1) {
        cropsList[targetCropIndex].offersCount = (cropsList[targetCropIndex].offersCount || 0) + 1;
        await AsyncStorage.setItem(SHARED_STORAGE_KEYS.CROPS, JSON.stringify(cropsList));
      }

      // Dispatch shared notification to farmer
      notificationService.dispatchNotification(
        'new_offer',
        `New Commercial Offer on ${offerData.cropName}!`,
        `${offerData.buyerName} placed an offer of LKR ${offerData.offeredPricePerKg}/kg for ${offerData.requestedQuantityKg.toLocaleString()}kg.`,
        `/farmer/compare-offers/${offerData.cropListingId}`,
        { listingId: offerData.cropListingId, buyerId: offerData.buyerId }
      );
    } catch {
      // Memory fallback
    }

    return newOffer;
  }

  async cancelOffer(offerId: string): Promise<boolean> {
    try {
      const storedOffersJson = await AsyncStorage.getItem(SHARED_STORAGE_KEYS.OFFERS);
      if (!storedOffersJson) return false;
      const offersList: BuyerOffer[] = JSON.parse(storedOffersJson);
      const target = offersList.find(o => o.id === offerId);
      if (target && target.status === 'Pending') {
        target.status = 'Cancelled' as any;
        await AsyncStorage.setItem(SHARED_STORAGE_KEYS.OFFERS, JSON.stringify(offersList));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // --- PURCHASE REQUIREMENTS ---

  async getRequirements(buyerId: string = 'user_buyer_001'): Promise<PurchaseRequirement[]> {
    await this.loadFromStorage();
    return this.requirements.filter(r => r.buyerId === buyerId);
  }

  async getRequirementById(id: string): Promise<PurchaseRequirement | null> {
    await this.loadFromStorage();
    const found = this.requirements.find(r => r.id === id);
    return found ? { ...found } : null;
  }

  async createRequirement(data: Omit<PurchaseRequirement, 'id' | 'createdAt'>): Promise<PurchaseRequirement> {
    await this.loadFromStorage();

    const newReq: PurchaseRequirement = {
      ...data,
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.requirements.unshift(newReq);
    await AsyncStorage.setItem(SHARED_STORAGE_KEYS.REQUIREMENTS, JSON.stringify(this.requirements));

    return newReq;
  }

  async updateRequirement(id: string, updates: Partial<PurchaseRequirement>): Promise<PurchaseRequirement | null> {
    await this.loadFromStorage();
    const index = this.requirements.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.requirements[index] = { ...this.requirements[index], ...updates };
    await AsyncStorage.setItem(SHARED_STORAGE_KEYS.REQUIREMENTS, JSON.stringify(this.requirements));
    return { ...this.requirements[index] };
  }

  async deleteRequirement(id: string): Promise<boolean> {
    await this.loadFromStorage();
    const prev = this.requirements.length;
    this.requirements = this.requirements.filter(r => r.id !== id);
    await AsyncStorage.setItem(SHARED_STORAGE_KEYS.REQUIREMENTS, JSON.stringify(this.requirements));
    return this.requirements.length < prev;
  }

  // --- FARMER DISCOVERY ---

  async getFarmers(search?: string, district?: string): Promise<FarmerLead[]> {
    await this.loadFromStorage();
    let result = [...this.farmers];

    if (district && district !== 'All') {
      result = result.filter(f => f.district.toLowerCase() === district.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        f =>
          f.name.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q) ||
          f.cropsOffered.some(c => c.toLowerCase().includes(q))
      );
    }

    return result;
  }

  async getFarmerById(id: string): Promise<FarmerLead | null> {
    await this.loadFromStorage();
    const f = this.farmers.find(item => item.id === id);
    return f ? { ...f } : null;
  }

  async getCropsByFarmerId(farmerId: string): Promise<CropListing[]> {
    const allCrops = await farmerService.getCropListings();
    return allCrops.filter(c => c.farmerId === farmerId);
  }

  // --- BUYER NOTIFICATIONS ---

  async getNotifications(): Promise<BuyerNotification[]> {
    await this.loadFromStorage();
    return [...this.notifications];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.loadFromStorage();
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
      await AsyncStorage.setItem(SHARED_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.loadFromStorage();
    this.notifications.forEach(n => (n.read = true));
    await AsyncStorage.setItem(SHARED_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
  }
}

export const buyerService = new BuyerService();
