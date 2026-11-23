import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { SelectModal } from '../../components/common/SelectModal';
import { usePrediction } from '../../context/PredictionContext';
import { BuyerOfferEvaluation } from '../../types/prediction';

export default function OfferComparisonScreen() {
  const router = useRouter();
  const { supportedCrops, evaluateBuyerOffers } = usePrediction();
  const [selectedCrop, setSelectedCrop] = useState<string>('Big Onions');
  const [evalData, setEvalData] = useState<{
    fairPricePerKg: number;
    highestOffer: number;
    lowestOffer: number;
    averageOffer: number;
    evaluations: BuyerOfferEvaluation[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cropOptions = supportedCrops.map(c => ({
    label: `${c.name} (${c.sinhalaName})`,
    value: c.name,
    subtitle: `${c.category} • Base LKR ${c.baselinePriceLkr}/kg`,
  }));

  const loadEvaluations = async (crop: string) => {
    setIsLoading(true);
    try {
      const data = await evaluateBuyerOffers(crop);
      setEvalData(data);
    } catch {
      Alert.alert('Error', 'Unable to evaluate buyer offers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations(selectedCrop);
  }, [selectedCrop]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Buyer Offer Evaluator"
        subtitle="Benchmark incoming purchasing bids against AI fair market value"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Crop Selector Card */}
        <View style={[styles.filterCard, Shadows.card]}>
          <SelectModal
            label="Select Crop to Evaluate"
            value={selectedCrop}
            options={cropOptions}
            onSelect={setSelectedCrop}
            iconName="leaf-outline"
          />
        </View>

        {evalData && (
          <>
            {/* Market Benchmark vs Offers KPI Cards */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, { borderTopColor: Colors.primary }, Shadows.card]}>
                <Text style={styles.kpiLabel}>AI Fair Price</Text>
                <Text style={[styles.kpiVal, { color: Colors.primary }]}>
                  LKR {evalData.fairPricePerKg}
                </Text>
                <Text style={styles.kpiSub}>Wholesale Baseline</Text>
              </View>

              <View style={[styles.kpiCard, { borderTopColor: '#16A34A' }, Shadows.card]}>
                <Text style={styles.kpiLabel}>Highest Offer</Text>
                <Text style={[styles.kpiVal, { color: '#16A34A' }]}>
                  LKR {evalData.highestOffer}
                </Text>
                <Text style={styles.kpiSub}>
                  {evalData.highestOffer >= evalData.fairPricePerKg ? '+ Above Fair' : 'Under Fair'}
                </Text>
              </View>

              <View style={[styles.kpiCard, { borderTopColor: '#0284C7' }, Shadows.card]}>
                <Text style={styles.kpiLabel}>Average Offer</Text>
                <Text style={[styles.kpiVal, { color: '#0284C7' }]}>
                  LKR {evalData.averageOffer}
                </Text>
                <Text style={styles.kpiSub}>Mean Buyer Bid</Text>
              </View>

              <View style={[styles.kpiCard, { borderTopColor: '#DC2626' }, Shadows.card]}>
                <Text style={styles.kpiLabel}>Lowest Offer</Text>
                <Text style={[styles.kpiVal, { color: '#DC2626' }]}>
                  LKR {evalData.lowestOffer}
                </Text>
                <Text style={styles.kpiSub}>Floor Bid</Text>
              </View>
            </View>

            {/* Informational Guidance Box */}
            <View style={styles.infoBanner}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Farmer Protection & Fair Pricing</Text>
                <Text style={styles.infoText}>
                  CropConnect evaluates bids automatically to prevent predatory below-market buying. Offers
                  are never automatically accepted or rejected; you retain 100% final transaction authority.
                </Text>
              </View>
            </View>

            {/* Buyer Offer Evaluations List */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Active Offers for {selectedCrop} ({evalData.evaluations.length})
              </Text>
              <Text style={styles.sectionSubtitle}>
                Bids categorized relative to fair-market farmgate value
              </Text>
            </View>

            {evalData.evaluations.map(offer => {
              const isAbove = offer.evaluation === 'above_market';
              const isBelow = offer.evaluation === 'below_market';
              const isWithin = offer.evaluation === 'within_range';

              const badgeColor = isAbove ? '#16A34A' : isBelow ? '#DC2626' : '#D97706';
              const badgeBg = isAbove ? '#DCFCE7' : isBelow ? '#FEE2E2' : '#FEF3C7';
              const badgeLabel = isAbove
                ? 'Above Market Price'
                : isBelow
                ? 'Below Market Price'
                : 'Within Market Range';

              return (
                <View key={offer.offerId} style={[styles.offerCard, Shadows.card]}>
                  <View style={styles.offerTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.buyerName}>{offer.buyerName}</Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                        <Text style={styles.locationText}>{offer.buyerLocation}</Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
                        {badgeLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.metricLabel}>Offered Price</Text>
                      <Text style={styles.metricValue}>
                        LKR {offer.offeredPricePerKg}
                        <Text style={styles.metricUnit}> /kg</Text>
                      </Text>
                    </View>

                    <View style={styles.varianceBox}>
                      <Text style={styles.metricLabel}>Variance vs Fair Price</Text>
                      <Text
                        style={[
                          styles.varianceText,
                          { color: offer.differenceLkr >= 0 ? '#16A34A' : '#DC2626' },
                        ]}
                      >
                        {offer.differenceLkr >= 0 ? '+' : ''}LKR {offer.differenceLkr} (
                        {offer.differencePercent >= 0 ? '+' : ''}
                        {offer.differencePercent}%)
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.metricLabel}>Requested Volume</Text>
                      <Text style={styles.metricValue}>
                        {offer.requestedQuantityKg.toLocaleString()} kg
                      </Text>
                    </View>
                  </View>

                  {offer.notes && (
                    <View style={styles.notesBox}>
                      <Ionicons name="chatbox-ellipses-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.notesText}>{offer.notes}</Text>
                    </View>
                  )}

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => router.push(`/(farmer)/offers` as any)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailsBtnText}>View in Offers Inbox</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.contactBtn}
                      onPress={() => {
                        Alert.alert(
                          'Direct Buyer Communication',
                          `Initiate price negotiation with ${offer.buyerName} regarding their LKR ${offer.offeredPricePerKg}/kg offer?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Open Dialpad',
                              onPress: () => Linking.openURL('tel:+94771234567'),
                            },
                          ]
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call" size={14} color={Colors.white} />
                      <Text style={styles.contactBtnText}>Negotiate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  filterCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderTopWidth: 3,
  },
  kpiLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  kpiVal: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EAF6F0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 11,
    color: Colors.textDark,
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  offerCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  offerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  buyerName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  varianceBox: {
    alignItems: 'center',
  },
  varianceText: {
    fontSize: 12,
    fontWeight: '800',
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 11,
    color: Colors.textDark,
    flex: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  contactBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
});
