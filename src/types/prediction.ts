export type CropQualityGrade = 'Standard' | 'Good' | 'Premium';

export type PriceTrendDirection = 'increasing' | 'decreasing' | 'stable';

export type OfferEvaluationStatus = 'below_market' | 'within_range' | 'above_market';

export interface PredictionImpactFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  multiplierText: string;
}

export interface PredictionRequest {
  cropName: string;
  district: string;
  quantityKg: number;
  quality: CropQualityGrade;
  harvestDate?: string;
}

export interface PredictionResult {
  id: string;
  cropName: string;
  district: string;
  quantityKg: number;
  quality: CropQualityGrade;
  harvestDate: string;
  estimatedPricePerKg: number;
  minExpectedPrice: number;
  maxExpectedPrice: number;
  suggestedSellingPrice: number;
  estimatedTotalValue: number;
  trend: PriceTrendDirection;
  trendPercentage: number;
  confidenceIndicator: string;
  explanation: string;
  factors: PredictionImpactFactor[];
  predictionDate: string;
  sourceBaseline: string;
  isSimulatedHeuristic: boolean;
}

export interface DistrictPriceRecord {
  district: string;
  cropName: string;
  avgPricePerKg: number;
  minPricePerKg: number;
  maxPricePerKg: number;
  isHighestPrice: boolean;
  isLowestPrice: boolean;
  marketCentre: string;
  province: string;
}

export interface PriceTrendPoint {
  date: string;
  label: string;
  price: number;
  volumeKg?: number;
  lowPrice?: number;
  highPrice?: number;
}

export interface BuyerOfferEvaluation {
  offerId: string;
  buyerName: string;
  cropName: string;
  offeredPricePerKg: number;
  requestedQuantityKg: number;
  totalOfferValueLkr: number;
  fairPricePerKg: number;
  differenceLkr: number;
  differencePercent: number;
  evaluation: OfferEvaluationStatus;
  buyerLocation: string;
  offerDate: string;
  notes?: string;
}

export interface PriceAlert {
  id: string;
  cropName: string;
  district: string;
  targetPricePerKg: number;
  condition: 'above' | 'below';
  isEnabled: boolean;
  createdAt: string;
  currentEstimatedPrice: number;
  isTriggered: boolean;
}

export interface RecordedHistoricalPrice {
  id: string;
  cropName: string;
  category: string;
  district: string;
  recordedDate: string;
  marketPricePerKg: number;
  minPricePerKg: number;
  maxPricePerKg: number;
  dataSource: string;
  isVerifiedGovt: boolean;
}

export interface CropPresetDefinition {
  name: string;
  sinhalaName: string;
  category: 'Vegetables' | 'Fruits' | 'Grains & Paddy' | 'Tubers & Roots' | 'Spices';
  baselinePriceLkr: number;
  typicalMinPrice: number;
  typicalMaxPrice: number;
  unit: string;
  image: string;
}
