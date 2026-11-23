import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CropPresetDefinition,
  DistrictPriceRecord,
  PredictionRequest,
  PredictionResult,
  PriceAlert,
  PriceTrendPoint,
  RecordedHistoricalPrice,
  BuyerOfferEvaluation,
} from '../types/prediction';
import { predictionService, SUPPORTED_CROPS } from '../services/predictionService';

interface PredictionContextType {
  supportedCrops: CropPresetDefinition[];
  activePrediction: PredictionResult | null;
  isPredicting: boolean;
  predictionHistory: PredictionResult[];
  priceAlerts: PriceAlert[];
  predictFairPrice: (req: PredictionRequest) => Promise<PredictionResult>;
  deleteHistoryItem: (id: string) => Promise<boolean>;
  clearHistory: () => Promise<void>;
  createPriceAlert: (
    alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered' | 'currentEstimatedPrice'>
  ) => Promise<PriceAlert>;
  togglePriceAlert: (id: string) => Promise<PriceAlert | null>;
  deletePriceAlert: (id: string) => Promise<boolean>;
  getDistrictComparisons: (cropName: string) => DistrictPriceRecord[];
  getPriceTrends: (
    cropName: string,
    district: string,
    timeframe: 'daily' | 'weekly' | 'monthly'
  ) => { points: PriceTrendPoint[]; avgPrice: number; highestPrice: number; lowestPrice: number };
  evaluateBuyerOffers: (
    cropName: string,
    district?: string
  ) => Promise<{
    fairPricePerKg: number;
    highestOffer: number;
    lowestOffer: number;
    averageOffer: number;
    evaluations: BuyerOfferEvaluation[];
  }>;
  getRecordedPrices: (params?: {
    cropName?: string;
    district?: string;
    searchQuery?: string;
    sortBy?: 'date_desc' | 'price_asc' | 'price_desc';
  }) => RecordedHistoricalPrice[];
  refreshData: () => Promise<void>;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionHistory, setPredictionHistory] = useState<PredictionResult[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);

  const refreshData = useCallback(async () => {
    try {
      const [history, alerts] = await Promise.all([
        predictionService.getPredictionHistory(),
        predictionService.getPriceAlerts(),
      ]);
      setPredictionHistory(history);
      setPriceAlerts(alerts);
    } catch (e) {
      console.warn('PredictionContext refreshData error:', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const predictFairPrice = async (req: PredictionRequest): Promise<PredictionResult> => {
    setIsPredicting(true);
    try {
      const res = await predictionService.predictFairPrice(req);
      setActivePrediction(res);
      await refreshData();
      return res;
    } finally {
      setIsPredicting(false);
    }
  };

  const deleteHistoryItem = async (id: string): Promise<boolean> => {
    const success = await predictionService.deletePredictionHistoryItem(id);
    if (success) {
      setPredictionHistory(prev => prev.filter(item => item.id !== id));
      if (activePrediction?.id === id) {
        setActivePrediction(null);
      }
    }
    return success;
  };

  const clearHistory = async (): Promise<void> => {
    await predictionService.clearPredictionHistory();
    setPredictionHistory([]);
  };

  const createPriceAlert = async (
    alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered' | 'currentEstimatedPrice'>
  ): Promise<PriceAlert> => {
    const newAlert = await predictionService.createPriceAlert(alertData);
    setPriceAlerts(prev => [newAlert, ...prev]);
    return newAlert;
  };

  const togglePriceAlert = async (id: string): Promise<PriceAlert | null> => {
    const updated = await predictionService.togglePriceAlert(id);
    if (updated) {
      setPriceAlerts(prev => prev.map(a => (a.id === id ? { ...a, isEnabled: updated.isEnabled, isTriggered: updated.isTriggered } : a)));
    }
    return updated;
  };

  const deletePriceAlert = async (id: string): Promise<boolean> => {
    const ok = await predictionService.deletePriceAlert(id);
    if (ok) {
      setPriceAlerts(prev => prev.filter(a => a.id !== id));
    }
    return ok;
  };

  const getDistrictComparisons = (cropName: string): DistrictPriceRecord[] => {
    return predictionService.getDistrictComparisons(cropName);
  };

  const getPriceTrends = (
    cropName: string,
    district: string,
    timeframe: 'daily' | 'weekly' | 'monthly'
  ) => {
    return predictionService.getPriceTrends(cropName, district, timeframe);
  };

  const evaluateBuyerOffers = async (cropName: string, district?: string) => {
    return predictionService.evaluateBuyerOffers(cropName, district);
  };

  const getRecordedPrices = (params?: {
    cropName?: string;
    district?: string;
    searchQuery?: string;
    sortBy?: 'date_desc' | 'price_asc' | 'price_desc';
  }): RecordedHistoricalPrice[] => {
    return predictionService.getRecordedHistoricalPrices(params);
  };

  return (
    <PredictionContext.Provider
      value={{
        supportedCrops: SUPPORTED_CROPS,
        activePrediction,
        isPredicting,
        predictionHistory,
        priceAlerts,
        predictFairPrice,
        deleteHistoryItem,
        clearHistory,
        createPriceAlert,
        togglePriceAlert,
        deletePriceAlert,
        getDistrictComparisons,
        getPriceTrends,
        evaluateBuyerOffers,
        getRecordedPrices,
        refreshData,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = (): PredictionContextType => {
  const ctx = useContext(PredictionContext);
  if (!ctx) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return ctx;
};
