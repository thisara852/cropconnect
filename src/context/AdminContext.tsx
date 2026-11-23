import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { adminService } from '../services/adminService';

interface AdminContextType {
  farmers: AdminFarmerUser[];
  buyers: AdminBuyerUser[];
  crops: CropListing[];
  offers: BuyerOffer[];
  requirements: PurchaseRequirement[];
  prices: MarketPriceRecord[];
  complaints: AdminComplaint[];
  announcements: PlatformAnnouncement[];
  stats: PlatformStats;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateFarmerStatus: (id: string, status: UserAccountStatus) => Promise<void>;
  updateFarmer: (id: string, updates: Partial<AdminFarmerUser>) => Promise<void>;
  updateBuyerVerification: (id: string, status: BuyerVerificationStatus) => Promise<void>;
  updateBuyer: (id: string, updates: Partial<AdminBuyerUser>) => Promise<void>;
  updateCropStatus: (id: string, status: CropListing['status']) => Promise<void>;
  removeCropListing: (id: string) => Promise<void>;
  addPriceRecord: (data: Omit<MarketPriceRecord, 'id'>) => Promise<void>;
  updatePriceRecord: (id: string, updates: Partial<MarketPriceRecord>) => Promise<void>;
  deletePriceRecord: (id: string) => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus, response?: string) => Promise<void>;
  createAnnouncement: (data: Omit<PlatformAnnouncement, 'id'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<PlatformAnnouncement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

const defaultStats: PlatformStats = {
  totalFarmers: 0,
  totalBuyers: 0,
  totalListings: 0,
  totalOffers: 0,
  totalRequirements: 0,
  pendingVerifications: 0,
  pendingComplaints: 0,
  totalVolumeListedKg: 0,
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farmers, setFarmers] = useState<AdminFarmerUser[]>([]);
  const [buyers, setBuyers] = useState<AdminBuyerUser[]>([]);
  const [crops, setCrops] = useState<CropListing[]>([]);
  const [offers, setOffers] = useState<BuyerOffer[]>([]);
  const [requirements, setRequirements] = useState<PurchaseRequirement[]>([]);
  const [prices, setPrices] = useState<MarketPriceRecord[]>([]);
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [stats, setStats] = useState<PlatformStats>(defaultStats);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      const [
        farmersList,
        buyersList,
        cropsList,
        offersList,
        reqsList,
        pricesList,
        complaintsList,
        announcementsList,
        statsData,
      ] = await Promise.all([
        adminService.getFarmers(),
        adminService.getBuyers(),
        adminService.getCrops(),
        adminService.getOffers(),
        adminService.getRequirements(),
        adminService.getPrices(),
        adminService.getComplaints(),
        adminService.getAnnouncements(),
        adminService.getPlatformStats(),
      ]);

      setFarmers(farmersList);
      setBuyers(buyersList);
      setCrops(cropsList);
      setOffers(offersList);
      setRequirements(reqsList);
      setPrices(pricesList);
      setComplaints(complaintsList);
      setAnnouncements(announcementsList);
      setStats(statsData);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateFarmerStatus = async (id: string, status: UserAccountStatus) => {
    await adminService.updateFarmerStatus(id, status);
    await refreshData();
  };

  const updateFarmer = async (id: string, updates: Partial<AdminFarmerUser>) => {
    await adminService.updateFarmer(id, updates);
    await refreshData();
  };

  const updateBuyerVerification = async (id: string, status: BuyerVerificationStatus) => {
    await adminService.updateBuyerVerification(id, status);
    await refreshData();
  };

  const updateBuyer = async (id: string, updates: Partial<AdminBuyerUser>) => {
    await adminService.updateBuyer(id, updates);
    await refreshData();
  };

  const updateCropStatus = async (id: string, status: CropListing['status']) => {
    await adminService.updateCropStatus(id, status);
    await refreshData();
  };

  const removeCropListing = async (id: string) => {
    await adminService.removeCropListing(id);
    await refreshData();
  };

  const addPriceRecord = async (data: Omit<MarketPriceRecord, 'id'>) => {
    await adminService.addPrice(data);
    await refreshData();
  };

  const updatePriceRecord = async (id: string, updates: Partial<MarketPriceRecord>) => {
    await adminService.updatePrice(id, updates);
    await refreshData();
  };

  const deletePriceRecord = async (id: string) => {
    await adminService.deletePrice(id);
    await refreshData();
  };

  const updateComplaintStatus = async (id: string, status: ComplaintStatus, response?: string) => {
    await adminService.updateComplaintStatus(id, status, response);
    await refreshData();
  };

  const createAnnouncement = async (data: Omit<PlatformAnnouncement, 'id'>) => {
    await adminService.createAnnouncement(data);
    await refreshData();
  };

  const updateAnnouncement = async (id: string, updates: Partial<PlatformAnnouncement>) => {
    await adminService.updateAnnouncement(id, updates);
    await refreshData();
  };

  const deleteAnnouncement = async (id: string) => {
    await adminService.deleteAnnouncement(id);
    await refreshData();
  };

  return (
    <AdminContext.Provider
      value={{
        farmers,
        buyers,
        crops,
        offers,
        requirements,
        prices,
        complaints,
        announcements,
        stats,
        isLoading,
        refreshData,
        updateFarmerStatus,
        updateFarmer,
        updateBuyerVerification,
        updateBuyer,
        updateCropStatus,
        removeCropListing,
        addPriceRecord,
        updatePriceRecord,
        deletePriceRecord,
        updateComplaintStatus,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
