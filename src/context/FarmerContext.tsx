import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CropListing,
  BuyerLead,
  BuyerOffer,
  FarmerNotification,
} from '../types/farmer';
import { farmerService } from '../services/farmerService';

interface FarmerContextType {
  crops: CropListing[];
  buyers: BuyerLead[];
  offers: BuyerOffer[];
  notifications: FarmerNotification[];
  unreadNotifsCount: number;
  totalActiveCrops: number;
  totalOffersReceived: number;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addCrop: (data: Omit<CropListing, 'id' | 'createdAt' | 'viewsCount' | 'offersCount'>) => Promise<CropListing>;
  updateCrop: (id: string, updates: Partial<CropListing>) => Promise<CropListing | null>;
  deleteCrop: (id: string) => Promise<boolean>;
  respondToOffer: (offerId: string, decision: 'Accepted' | 'Rejected') => Promise<boolean>;
  markNotificationAsRead: (id: string) => Promise<void>;
  sendBuyerEnquiry: (buyerId: string, message: string, cropName: string) => Promise<boolean>;
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [crops, setCrops] = useState<CropListing[]>([]);
  const [buyers, setBuyers] = useState<BuyerLead[]>([]);
  const [offers, setOffers] = useState<BuyerOffer[]>([]);
  const [notifications, setNotifications] = useState<FarmerNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      const [cropsList, buyersList, offersList, notifsList] = await Promise.all([
        farmerService.getCropListings(),
        farmerService.getNearbyBuyers(),
        farmerService.getAllFarmerOffers(),
        farmerService.getNotifications(),
      ]);
      setCrops(cropsList);
      setBuyers(buyersList);
      setOffers(offersList);
      setNotifications(notifsList);
    } catch (e) {
      console.error('Failed to load farmer data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addCrop = async (
    data: Omit<CropListing, 'id' | 'createdAt' | 'viewsCount' | 'offersCount'>
  ): Promise<CropListing> => {
    const newCrop = await farmerService.addCropListing(data);
    await refreshData();
    return newCrop;
  };

  const updateCrop = async (id: string, updates: Partial<CropListing>): Promise<CropListing | null> => {
    const updated = await farmerService.updateCropListing(id, updates);
    await refreshData();
    return updated;
  };

  const deleteCrop = async (id: string): Promise<boolean> => {
    const ok = await farmerService.deleteCropListing(id);
    await refreshData();
    return ok;
  };

  const respondToOffer = async (offerId: string, decision: 'Accepted' | 'Rejected'): Promise<boolean> => {
    const ok = await farmerService.respondToOffer(offerId, decision);
    await refreshData();
    return ok;
  };

  const markNotificationAsRead = async (id: string): Promise<void> => {
    await farmerService.markNotificationAsRead(id);
    await refreshData();
  };

  const sendBuyerEnquiry = async (buyerId: string, message: string, cropName: string): Promise<boolean> => {
    const ok = await farmerService.sendBuyerEnquiry(buyerId, message, cropName);
    await refreshData();
    return ok;
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const totalActiveCrops = crops.filter(c => c.status === 'Active' || c.status === 'Rescue Alert').length;
  const totalOffersReceived = offers.length;

  return (
    <FarmerContext.Provider
      value={{
        crops,
        buyers,
        offers,
        notifications,
        unreadNotifsCount,
        totalActiveCrops,
        totalOffersReceived,
        isLoading,
        refreshData,
        addCrop,
        updateCrop,
        deleteCrop,
        respondToOffer,
        markNotificationAsRead,
        sendBuyerEnquiry,
      }}
    >
      {children}
    </FarmerContext.Provider>
  );
};

export const useFarmer = (): FarmerContextType => {
  const context = useContext(FarmerContext);
  if (!context) {
    throw new Error('useFarmer must be used within a FarmerProvider');
  }
  return context;
};
