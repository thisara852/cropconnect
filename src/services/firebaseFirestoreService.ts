import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from './firebaseConfig';
import { CropListing, BuyerOffer, FarmerNotification } from '../types/farmer';
import { PurchaseRequirement } from '../types/buyer';
import { MarketPriceRecord, AdminComplaint, PlatformAnnouncement } from '../types/admin';
import { farmerService } from './farmerService';
import { buyerService } from './buyerService';
import { adminService } from './adminService';

class FirebaseFirestoreService {
  // --- 1. CROP LISTINGS ---
  async createListing(listingData: Omit<CropListing, 'id' | 'createdAt' | 'viewsCount' | 'offersCount'>): Promise<CropListing> {
    const newId = `crop_${Date.now()}`;
    const newListing: CropListing = {
      ...listingData,
      id: newId,
      createdAt: new Date().toISOString(),
      viewsCount: 0,
      offersCount: 0,
      status: listingData.status || 'Active',
    };

    if (isLiveFirebaseConfigured()) {
      try {
        await setDoc(doc(db, 'cropListings', newId), newListing);
        return newListing;
      } catch (err: any) {
        console.warn('Firestore createListing failed, falling back to local service:', err.message);
      }
    }

    return farmerService.addCropListing(listingData);
  }

  async updateListing(id: string, updates: Partial<CropListing>): Promise<CropListing | null> {
    if (isLiveFirebaseConfigured()) {
      try {
        const ref = doc(db, 'cropListings', id);
        await updateDoc(ref, updates);
        const updated = await getDoc(ref);
        return updated.data() as CropListing;
      } catch (err: any) {
        console.warn('Firestore updateListing failed:', err.message);
      }
    }
    return farmerService.updateCropListing(id, updates);
  }

  async deleteListing(id: string): Promise<boolean> {
    if (isLiveFirebaseConfigured()) {
      try {
        await deleteDoc(doc(db, 'cropListings', id));
        return true;
      } catch (err: any) {
        console.warn('Firestore deleteListing failed:', err.message);
      }
    }
    return farmerService.deleteCropListing(id);
  }

  async getListings(): Promise<CropListing[]> {
    if (isLiveFirebaseConfigured()) {
      try {
        const q = query(collection(db, 'cropListings'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as CropListing);
        }
      } catch (err: any) {
        console.warn('Firestore getListings failed, reading local data:', err.message);
      }
    }
    return farmerService.getCropListings();
  }

  onListingsSnapshot(callback: (listings: CropListing[]) => void): Unsubscribe {
    if (isLiveFirebaseConfigured()) {
      try {
        const q = query(collection(db, 'cropListings'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, snap => {
          const list = snap.docs.map(d => d.data() as CropListing);
          callback(list);
        });
      } catch {}
    }
    // Fallback: poll or initial load
    farmerService.getCropListings().then(callback);
    return () => {};
  }

  // --- 2. SHARED OFFER MANAGEMENT ---
  async submitOffer(offerData: {
    cropListingId: string;
    cropName: string;
    buyerId: string;
    buyerName: string;
    buyerAvatar?: string;
    buyerPhone: string;
    buyerLocation: string;
    offeredPricePerKg: number;
    requestedQuantityKg: number;
    notes?: string;
    targetFarmerId?: string;
  }): Promise<BuyerOffer> {
    const offerId = `offer_${Date.now()}`;
    const totalValueLkr = offerData.offeredPricePerKg * offerData.requestedQuantityKg;
    const createdAt = new Date().toISOString();

    const newOffer: BuyerOffer = {
      id: offerId,
      cropListingId: offerData.cropListingId,
      cropName: offerData.cropName,
      buyerId: offerData.buyerId,
      buyerName: offerData.buyerName,
      buyerAvatar: offerData.buyerAvatar,
      buyerLocation: offerData.buyerLocation,
      buyerPhone: offerData.buyerPhone,
      offeredPricePerKg: offerData.offeredPricePerKg,
      requestedQuantityKg: offerData.requestedQuantityKg,
      totalValueLkr,
      offerDate: createdAt,
      status: 'Pending',
      isBestOffer: false,
      notes: offerData.notes,
    };

    if (isLiveFirebaseConfigured()) {
      try {
        await setDoc(doc(db, 'offers', offerId), {
          ...newOffer,
          farmerId: offerData.targetFarmerId || 'user_farmer_001',
        });

        // Trigger in-app notification to the farmer
        await this.createNotification({
          recipientId: offerData.targetFarmerId || 'user_farmer_001',
          type: 'offer',
          title: `New Offer on ${offerData.cropName}!`,
          message: `${offerData.buyerName} offered LKR ${offerData.offeredPricePerKg}/kg for ${offerData.requestedQuantityKg.toLocaleString()}kg.`,
          targetId: offerData.cropListingId,
        });

        return newOffer;
      } catch (err: any) {
        console.warn('Firestore submitOffer failed, fallback to local services:', err.message);
      }
    }

    // Local fallback in FarmerService & BuyerService
    await farmerService.receiveOffer(newOffer);
    return newOffer;
  }

  async respondToOffer(offerId: string, decision: 'Accepted' | 'Rejected'): Promise<boolean> {
    if (isLiveFirebaseConfigured()) {
      try {
        const ref = doc(db, 'offers', offerId);
        await updateDoc(ref, { status: decision });

        const snap = await getDoc(ref);
        if (snap.exists()) {
          const offer = snap.data();
          // Notify buyer of decision
          await this.createNotification({
            recipientId: offer.buyerId,
            type: 'system',
            title: `Offer ${decision}!`,
            message: `Your offer for ${offer.requestedQuantityKg}kg of ${offer.cropName} at LKR ${offer.offeredPricePerKg}/kg was ${decision.toLowerCase()} by the farmer.`,
            targetId: offer.cropListingId,
          });
        }
        return true;
      } catch (err: any) {
        console.warn('Firestore respondToOffer failed:', err.message);
      }
    }
    return farmerService.respondToOffer(offerId, decision);
  }

  async getOffersForListing(listingId: string): Promise<BuyerOffer[]> {
    if (isLiveFirebaseConfigured()) {
      try {
        const q = query(collection(db, 'offers'), where('cropListingId', '==', listingId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as BuyerOffer);
        }
      } catch {}
    }
    return farmerService.getOffersForCrop(listingId);
  }

  async getAllFarmerOffers(): Promise<BuyerOffer[]> {
    if (isLiveFirebaseConfigured()) {
      try {
        const q = query(collection(db, 'offers'), orderBy('offerDate', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as BuyerOffer);
        }
      } catch {}
    }
    return farmerService.getAllFarmerOffers();
  }

  onOffersSnapshot(callback: (offers: BuyerOffer[]) => void): Unsubscribe {
    if (isLiveFirebaseConfigured()) {
      try {
        const q = query(collection(db, 'offers'), orderBy('offerDate', 'desc'));
        return onSnapshot(q, snap => {
          callback(snap.docs.map(d => d.data() as BuyerOffer));
        });
      } catch {}
    }
    farmerService.getAllFarmerOffers().then(callback);
    return () => {};
  }

  // --- 3. NOTIFICATIONS ---
  async createNotification(notifData: {
    recipientId: string;
    type: 'offer' | 'enquiry' | 'system' | 'listing';
    title: string;
    message: string;
    targetId?: string;
  }): Promise<FarmerNotification> {
    const notifId = `notif_${Date.now()}`;
    const newNotif: FarmerNotification = {
      id: notifId,
      type: notifData.type,
      title: notifData.title,
      message: notifData.message,
      timestamp: 'Just now',
      read: false,
      targetId: notifData.targetId,
    };

    if (isLiveFirebaseConfigured()) {
      try {
        await setDoc(doc(db, 'notifications', notifId), {
          ...newNotif,
          recipientId: notifData.recipientId,
          createdAt: new Date().toISOString(),
        });
        return newNotif;
      } catch {}
    }

    return newNotif;
  }

  async getNotifications(userId?: string): Promise<FarmerNotification[]> {
    if (isLiveFirebaseConfigured() && userId) {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('recipientId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as FarmerNotification);
        }
      } catch {}
    }
    return farmerService.getNotifications();
  }

  // --- 4. PURCHASE REQUIREMENTS ---
  async getPurchaseRequirements(): Promise<PurchaseRequirement[]> {
    if (isLiveFirebaseConfigured()) {
      try {
        const q = query(collection(db, 'purchaseRequirements'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as PurchaseRequirement);
        }
      } catch {}
    }
    return buyerService.getRequirements();
  }

  async createPurchaseRequirement(req: Omit<PurchaseRequirement, 'id' | 'createdAt'>): Promise<PurchaseRequirement> {
    const id = `req_${Date.now()}`;
    const newReq: PurchaseRequirement = {
      ...req,
      id,
      createdAt: new Date().toISOString(),
    };

    if (isLiveFirebaseConfigured()) {
      try {
        await setDoc(doc(db, 'purchaseRequirements', id), newReq);
        return newReq;
      } catch {}
    }
    return buyerService.createRequirement(req);
  }

  // --- 5. CROP PRICES (Admin Governance) ---
  async getCropPrices(): Promise<MarketPriceRecord[]> {
    if (isLiveFirebaseConfigured()) {
      try {
        const snap = await getDocs(collection(db, 'cropPrices'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as MarketPriceRecord);
        }
      } catch {}
    }
    return adminService.getPrices();
  }

  async addCropPrice(price: Omit<MarketPriceRecord, 'id'>): Promise<MarketPriceRecord> {
    const id = `price_${Date.now()}`;
    const newPrice: MarketPriceRecord = { ...price, id };

    if (isLiveFirebaseConfigured()) {
      try {
        await setDoc(doc(db, 'cropPrices', id), newPrice);
        return newPrice;
      } catch {}
    }
    return adminService.addPrice(price);
  }

  // --- 6. ANNOUNCEMENTS & COMPLAINTS ---
  async getAnnouncements(): Promise<PlatformAnnouncement[]> {
    if (isLiveFirebaseConfigured()) {
      try {
        const snap = await getDocs(collection(db, 'announcements'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as PlatformAnnouncement);
        }
      } catch {}
    }
    return adminService.getAnnouncements();
  }

  async createAnnouncement(data: Omit<PlatformAnnouncement, 'id' | 'publishedDate'>): Promise<PlatformAnnouncement> {
    const id = `ann_${Date.now()}`;
    const newAnn: PlatformAnnouncement = {
      ...data,
      id,
      publishedDate: new Date().toISOString().split('T')[0],
      priority: data.priority || 'Normal',
      authorName: data.authorName || 'Platform Administrator',
      isActive: true,
    };

    if (isLiveFirebaseConfigured()) {
      try {
        await setDoc(doc(db, 'announcements', id), newAnn);
        return newAnn;
      } catch {}
    }
    return adminService.createAnnouncement(newAnn);
  }

  async getComplaints(): Promise<AdminComplaint[]> {
    if (isLiveFirebaseConfigured()) {
      try {
        const snap = await getDocs(collection(db, 'complaints'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as AdminComplaint);
        }
      } catch {}
    }
    return adminService.getComplaints();
  }

  async respondToComplaint(id: string, response: string): Promise<boolean> {
    if (isLiveFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'complaints', id), {
          adminResponse: response,
          status: 'Resolved',
        });
        return true;
      } catch {}
    }
    const res = await adminService.updateComplaintStatus(id, 'Resolved', response);
    return Boolean(res);
  }
}

export const firebaseFirestoreService = new FirebaseFirestoreService();
