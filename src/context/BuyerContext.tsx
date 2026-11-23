import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CropListing, BuyerOffer } from '../types/farmer';
import { PurchaseRequirement, FarmerLead, BuyerNotification } from '../types/buyer';
import { buyerService } from '../services/buyerService';
import { useAuth } from './AuthContext';

interface BuyerContextType {
  crops: CropListing[];
  offers: BuyerOffer[];
  requirements: PurchaseRequirement[];
  savedCropIds: string[];
  notifications: BuyerNotification[];
  farmers: FarmerLead[];
  unreadNotifsCount: number;
  totalAvailableCropsCount: number;
  sentOffersCount: number;
  acceptedOffersCount: number;
  activeRequirementsCount: number;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  submitOffer: (data: {
    cropListingId: string;
    cropName: string;
    buyerLocation: string;
    buyerPhone: string;
    offeredPricePerKg: number;
    requestedQuantityKg: number;
    collectionDate?: string;
    notes?: string;
  }) => Promise<BuyerOffer>;
  cancelOffer: (id: string) => Promise<boolean>;
  createRequirement: (data: Omit<PurchaseRequirement, 'id' | 'createdAt' | 'buyerId' | 'buyerName'>) => Promise<PurchaseRequirement>;
  updateRequirement: (id: string, updates: Partial<PurchaseRequirement>) => Promise<PurchaseRequirement | null>;
  deleteRequirement: (id: string) => Promise<boolean>;
  toggleSaveCrop: (cropId: string) => Promise<boolean>;
  isCropSaved: (cropId: string) => boolean;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const BuyerContext = createContext<BuyerContextType | undefined>(undefined);

export const BuyerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [crops, setCrops] = useState<CropListing[]>([]);
  const [offers, setOffers] = useState<BuyerOffer[]>([]);
  const [requirements, setRequirements] = useState<PurchaseRequirement[]>([]);
  const [savedCropIds, setSavedCropIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<BuyerNotification[]>([]);
  const [farmers, setFarmers] = useState<FarmerLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const buyerId = user?.id || 'user_buyer_001';
  const buyerName = user?.businessName || user?.name || 'Lanka Fresh Supermarkets Ltd';

  const refreshData = useCallback(async () => {
    try {
      const [cropsList, offersList, reqsList, savedList, notifsList, farmersList] = await Promise.all([
        buyerService.getAllAvailableCrops(),
        buyerService.getBuyerOffers(buyerId),
        buyerService.getRequirements(buyerId),
        buyerService.getSavedCropIds(),
        buyerService.getNotifications(),
        buyerService.getFarmers(),
      ]);

      setCrops(cropsList);
      setOffers(offersList);
      setRequirements(reqsList);
      setSavedCropIds(savedList);
      setNotifications(notifsList);
      setFarmers(farmersList);
    } catch (e) {
      console.error('Failed to load buyer data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const submitOffer = async (data: {
    cropListingId: string;
    cropName: string;
    buyerLocation: string;
    buyerPhone: string;
    offeredPricePerKg: number;
    requestedQuantityKg: number;
    collectionDate?: string;
    notes?: string;
  }): Promise<BuyerOffer> => {
    const newOffer = await buyerService.submitOffer({
      ...data,
      buyerId,
      buyerName,
      buyerAvatar: user?.avatarUrl,
    });
    await refreshData();
    return newOffer;
  };

  const cancelOffer = async (id: string): Promise<boolean> => {
    const ok = await buyerService.cancelOffer(id);
    await refreshData();
    return ok;
  };

  const createRequirement = async (
    data: Omit<PurchaseRequirement, 'id' | 'createdAt' | 'buyerId' | 'buyerName'>
  ): Promise<PurchaseRequirement> => {
    const newReq = await buyerService.createRequirement({
      ...data,
      buyerId,
      buyerName,
    });
    await refreshData();
    return newReq;
  };

  const updateRequirement = async (
    id: string,
    updates: Partial<PurchaseRequirement>
  ): Promise<PurchaseRequirement | null> => {
    const updated = await buyerService.updateRequirement(id, updates);
    await refreshData();
    return updated;
  };

  const deleteRequirement = async (id: string): Promise<boolean> => {
    const ok = await buyerService.deleteRequirement(id);
    await refreshData();
    return ok;
  };

  const toggleSaveCrop = async (cropId: string): Promise<boolean> => {
    const saved = await buyerService.toggleSaveCrop(cropId);
    setSavedCropIds(prev => (saved ? [...prev, cropId] : prev.filter(id => id !== cropId)));
    return saved;
  };

  const isCropSaved = (cropId: string): boolean => {
    return savedCropIds.includes(cropId);
  };

  const markNotificationAsRead = async (id: string): Promise<void> => {
    await buyerService.markNotificationAsRead(id);
    await refreshData();
  };

  const markAllNotificationsRead = async (): Promise<void> => {
    await buyerService.markAllNotificationsRead();
    await refreshData();
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const totalAvailableCropsCount = crops.filter(c => c.status === 'Active' || c.status === 'Rescue Alert').length;
  const sentOffersCount = offers.length;
  const acceptedOffersCount = offers.filter(o => o.status === 'Accepted').length;
  const activeRequirementsCount = requirements.filter(r => r.status === 'Active').length;

  return (
    <BuyerContext.Provider
      value={{
        crops,
        offers,
        requirements,
        savedCropIds,
        notifications,
        farmers,
        unreadNotifsCount,
        totalAvailableCropsCount,
        sentOffersCount,
        acceptedOffersCount,
        activeRequirementsCount,
        isLoading,
        refreshData,
        submitOffer,
        cancelOffer,
        createRequirement,
        updateRequirement,
        deleteRequirement,
        toggleSaveCrop,
        isCropSaved,
        markNotificationAsRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </BuyerContext.Provider>
  );
};

export const useBuyer = (): BuyerContextType => {
  const context = useContext(BuyerContext);
  if (!context) {
    throw new Error('useBuyer must be used within a BuyerProvider');
  }
  return context;
};
