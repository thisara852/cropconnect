import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { SelectModal } from '../../components/common/SelectModal';
import { SRI_LANKAN_DISTRICTS } from '../../constants/districts';
import { useAuth } from '../../context/AuthContext';
import { usePrediction } from '../../context/PredictionContext';
import { CropQualityGrade, PredictionResult } from '../../types/prediction';

export default function AIFairPriceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    supportedCrops,
    activePrediction,
    isPredicting,
    predictFairPrice,
    predictionHistory,
    priceAlerts,
  } = usePrediction();

  // Form State
  const [selectedCrop, setSelectedCrop] = useState<string>('Big Onions');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Matale');
  const [quantity, setQuantity] = useState<string>('1500');
  const [quality, setQuality] = useState<CropQualityGrade>('Good');
  const [harvestDate, setHarvestDate] = useState<string>('In 3 Days');
  const [result, setResult] = useState<PredictionResult | null>(activePrediction);

  // Crop options for SelectModal
  const cropOptions = supportedCrops.map(c => ({
    label: `${c.name} (${c.sinhalaName})`,
    value: c.name,
    subtitle: `${c.category} • Base LKR ${c.baselinePriceLkr}/kg`,
  }));

  // District options
  const districtOptions = SRI_LANKAN_DISTRICTS.map(d => ({
    label: d.name,
    value: d.name,
    subtitle: `${d.sinhalaName} • ${d.province} Province`,
  }));

  // Run initial prediction if none is loaded
  useEffect(() => {
    if (!result) {
      predictFairPrice({
        cropName: 'Big Onions',
        district: 'Matale',
        quantityKg: 1500,
        quality: 'Good',
        harvestDate: '2026-11-26',
      }).then(res => setResult(res));
    }
  }, []);

  const handleCalculate = async () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid harvest quantity in kg.');
      return;
    }

    try {
      const res = await predictFairPrice({
        cropName: selectedCrop,
        district: selectedDistrict,
        quantityKg: qty,
        quality,
        harvestDate: harvestDate,
      });
      setResult(res);
    } catch {
      Alert.alert('Error', 'Unable to calculate price prediction. Please retry.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AI Fair-Price System</Text>
          <Text style={styles.headerSubtitle}>
            Welcome, {user?.name || 'Farmer'} • Agricultural Market Intelligence
          </Text>
        </View>

        <View style={styles.headerActionRow}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/prices/alerts' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
            {priceAlerts.some(a => a.isTriggered) && <View style={styles.alertDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/prices/prediction-history' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            {predictionHistory.length > 0 && (
              <View style={styles.badgeSmall}>
                <Text style={styles.badgeSmallText}>{predictionHistory.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Important Transparent Disclaimer */}
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerIconBox}>
              <Ionicons name="information-circle" size={20} color="#B45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.disclaimerTitle}>Transparency Notice & Disclaimer</Text>
              <Text style={styles.disclaimerText}>
                Predictions are rule-based heuristic estimates benchmarked from terminal wholesale data
                (Dambulla & Manning markets). They serve as negotiation guidance and are not guaranteed sales prices.
              </Text>
            </View>
          </View>

          {/* Quick Action Hub */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Market Intelligence Hub</Text>
          </View>

          <View style={styles.quickNavGrid}>
            <TouchableOpacity
              style={[styles.quickNavCard, Shadows.card]}
              onPress={() => router.push('/prices/district-comparison' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickNavIcon, { backgroundColor: '#EAF6F0' }]}>
                <Ionicons name="git-compare" size={18} color={Colors.secondary} />
              </View>
              <Text style={styles.quickNavTitle}>District Comparison</Text>
              <Text style={styles.quickNavSub}>Compare 12 districts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickNavCard, Shadows.card]}
              onPress={() => router.push('/prices/offer-comparison' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickNavIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="pricetags" size={18} color="#D97706" />
              </View>
              <Text style={styles.quickNavTitle}>Buyer Offers</Text>
              <Text style={styles.quickNavSub}>Evaluate price fairness</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickNavCard, Shadows.card]}
              onPress={() => router.push('/prices/history' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickNavIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="trending-up" size={18} color="#0284C7" />
              </View>
              <Text style={styles.quickNavTitle}>Price Trends</Text>
              <Text style={styles.quickNavSub}>Daily & monthly curves</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickNavCard, Shadows.card]}
              onPress={() => router.push('/prices/alerts' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickNavIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="notifications" size={18} color="#DC2626" />
              </View>
              <Text style={styles.quickNavTitle}>Price Alerts</Text>
              <Text style={styles.quickNavSub}>{priceAlerts.length} configured</Text>
            </TouchableOpacity>
          </View>

          {/* Current Selected Crop Snapshot Card */}
          {result && (
            <View style={[styles.snapshotCard, Shadows.card]}>
              <View style={styles.snapshotTopRow}>
                <View>
                  <Text style={styles.snapshotCropName}>
                    {result.cropName} • {result.district}
                  </Text>
                  <Text style={styles.snapshotDate}>
                    Last Updated: {new Date(result.predictionDate).toLocaleDateString()}
                  </Text>
                </View>

                <View
                  style={[
                    styles.trendBadge,
                    {
                      backgroundColor:
                        result.trend === 'increasing'
                          ? '#DCFCE7'
                          : result.trend === 'decreasing'
                          ? '#FEE2E2'
                          : '#FEF3C7',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      result.trend === 'increasing'
                        ? 'trending-up'
                        : result.trend === 'decreasing'
                        ? 'trending-down'
                        : 'remove'
                    }
                    size={14}
                    color={
                      result.trend === 'increasing'
                        ? '#15803D'
                        : result.trend === 'decreasing'
                        ? '#B91C1C'
                        : '#B45309'
                    }
                  />
                  <Text
                    style={[
                      styles.trendText,
                      {
                        color:
                          result.trend === 'increasing'
                            ? '#15803D'
                            : result.trend === 'decreasing'
                            ? '#B91C1C'
                            : '#B45309',
                      },
                    ]}
                  >
                    {result.trend.toUpperCase()} ({result.trendPercentage}%)
                  </Text>
                </View>
              </View>

              <View style={styles.snapshotPriceRow}>
                <View>
                  <Text style={styles.snapshotPriceLabel}>Estimated Fair Farmgate Price</Text>
                  <Text style={styles.snapshotPriceVal}>
                    LKR {result.estimatedPricePerKg}
                    <Text style={styles.snapshotPriceUnit}> /kg</Text>
                  </Text>
                </View>

                <View style={styles.snapshotRangeBox}>
                  <Text style={styles.snapshotRangeLabel}>Expected Range</Text>
                  <Text style={styles.snapshotRangeVal}>
                    LKR {result.minExpectedPrice} - {result.maxExpectedPrice}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Price Prediction Form Card */}
          <View style={[styles.formCard, Shadows.card]}>
            <View style={styles.formHeaderRow}>
              <View style={styles.formIconCircle}>
                <Ionicons name="sparkles" size={18} color={Colors.orange} />
              </View>
              <View>
                <Text style={styles.formTitle}>Price Prediction Form</Text>
                <Text style={styles.formSubtitle}>Configure parameters for farmgate valuation</Text>
              </View>
            </View>

            {/* Crop Selector */}
            <SelectModal
              label="Select Crop"
              value={selectedCrop}
              options={cropOptions}
              onSelect={setSelectedCrop}
              iconName="leaf-outline"
            />

            {/* District Selector */}
            <SelectModal
              label="Select District"
              value={selectedDistrict}
              options={districtOptions}
              onSelect={setSelectedDistrict}
              iconName="location-outline"
            />

            {/* Harvest Volume Input */}
            <Input
              label="Available Harvest Quantity (kg)"
              placeholder="e.g. 1500"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              iconName="cube-outline"
              helperText="Bulk lots qualify for transport clearance adjustments."
            />

            {/* Volume Quick Chips */}
            <View style={styles.chipsRow}>
              {['500', '1000', '2500', '5000'].map(chip => (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chipBtn, quantity === chip && styles.chipBtnActive]}
                  onPress={() => setQuantity(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, quantity === chip && styles.chipTextActive]}>
                    {parseInt(chip).toLocaleString()} kg
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Crop Quality Grade Selector */}
            <Text style={styles.fieldLabel}>Crop Quality Grade</Text>
            <View style={styles.qualityRow}>
              {(['Standard', 'Good', 'Premium'] as CropQualityGrade[]).map(q => {
                const isSelected = quality === q;
                const multiplierHint = q === 'Premium' ? '+18%' : q === 'Good' ? '+8%' : 'Base';
                return (
                  <TouchableOpacity
                    key={q}
                    style={[styles.qualityBtn, isSelected && styles.qualityBtnActive]}
                    onPress={() => setQuality(q)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        q === 'Premium'
                          ? 'ribbon'
                          : q === 'Good'
                          ? 'checkmark-circle'
                          : 'radio-button-on'
                      }
                      size={16}
                      color={isSelected ? Colors.white : Colors.textSecondary}
                    />
                    <Text style={[styles.qualityText, isSelected && styles.qualityTextActive]}>
                      {q}
                    </Text>
                    <Text style={[styles.qualitySub, isSelected && styles.qualitySubActive]}>
                      {multiplierHint}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Expected Harvest Date */}
            <Text style={styles.fieldLabel}>Expected Harvest Date</Text>
            <View style={styles.chipsRow}>
              {['Today', 'In 3 Days', 'Next Week', 'In 2 Weeks'].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chipBtn, harvestDate === d && styles.chipBtnActive]}
                  onPress={() => setHarvestDate(d)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, harvestDate === d && styles.chipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Predict Button */}
            <Button
              title="Predict Fair Price"
              variant="primary"
              size="large"
              isLoading={isPredicting}
              iconName="flash"
              iconPosition="left"
              onPress={handleCalculate}
              style={{ marginTop: 16 }}
            />
          </View>

          {/* Prediction Result Breakdown Card */}
          {result && (
            <View style={[styles.resultCard, Shadows.card]}>
              <View style={styles.resultHeaderRow}>
                <View>
                  <Text style={styles.resultBadge}>VALUATION RESULT</Text>
                  <Text style={styles.resultCropTitle}>
                    {result.cropName} ({result.quality} Grade)
                  </Text>
                </View>
                <View style={styles.resultTag}>
                  <Text style={styles.resultTagText}>{result.district}</Text>
                </View>
              </View>

              <View style={styles.resultMainBox}>
                <View style={styles.resultPriceCol}>
                  <Text style={styles.resultPriceLabel}>Estimated Fair Price</Text>
                  <Text style={styles.resultPriceNumber}>
                    LKR {result.estimatedPricePerKg}
                    <Text style={styles.resultPricePerKg}> /kg</Text>
                  </Text>
                  <Text style={styles.resultSuggested}>
                    Suggested Selling: LKR {result.suggestedSellingPrice} /kg
                  </Text>
                </View>

                <View style={styles.resultDivider} />

                <View style={styles.resultValCol}>
                  <Text style={styles.resultPriceLabel}>Total Batch Value</Text>
                  <Text style={styles.resultTotalNumber}>
                    LKR {result.estimatedTotalValue.toLocaleString()}
                  </Text>
                  <Text style={styles.resultQty}>For {result.quantityKg.toLocaleString()} kg</Text>
                </View>
              </View>

              {/* Range Indicator */}
              <View style={styles.rangeBarContainer}>
                <View style={styles.rangeLabelsRow}>
                  <Text style={styles.rangeLabelText}>Min: LKR {result.minExpectedPrice}</Text>
                  <Text style={styles.rangeLabelCenter}>Fair: LKR {result.estimatedPricePerKg}</Text>
                  <Text style={styles.rangeLabelText}>Max: LKR {result.maxExpectedPrice}</Text>
                </View>
                <View style={styles.rangeTrack}>
                  <View style={styles.rangeFill} />
                  <View style={styles.rangeThumb} />
                </View>
              </View>

              {/* Multi-Factor Impact Breakdown */}
              <View style={styles.factorsSection}>
                <Text style={styles.factorsTitle}>Calculation Impact Factors</Text>
                {result.factors.map((factor, idx) => (
                  <View key={idx} style={styles.factorRow}>
                    <View
                      style={[
                        styles.factorDot,
                        {
                          backgroundColor:
                            factor.impact === 'positive'
                              ? '#16A34A'
                              : factor.impact === 'negative'
                              ? '#DC2626'
                              : '#64748B',
                        },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.factorTop}>
                        <Text style={styles.factorName}>{factor.name}</Text>
                        <Text style={styles.factorMultiplier}>{factor.multiplierText}</Text>
                      </View>
                      <Text style={styles.factorDesc}>{factor.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Confidence & Source Info */}
              <View style={styles.sourceFooter}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
                <Text style={styles.sourceText}>
                  {result.confidenceIndicator} • Source: {result.sourceBaseline}
                </Text>
              </View>
            </View>
          )}

          {/* AI Explanation Section: 7 Key Market Drivers */}
          <View style={[styles.explanationCard, Shadows.card]}>
            <View style={styles.explanationHeaderRow}>
              <View style={[styles.formIconCircle, { backgroundColor: '#EAF6F0' }]}>
                <Ionicons name="bulb-outline" size={18} color={Colors.secondary} />
              </View>
              <View>
                <Text style={styles.explanationTitle}>How Crop Prices Are Estimated</Text>
                <Text style={styles.explanationSubtitle}>
                  Transparent rules governing Sri Lankan agricultural valuations
                </Text>
              </View>
            </View>

            {[
              {
                title: '1. Crop Type & Variety',
                text: 'High-demand staples (e.g. Big Onions, Green Chillies) fluctuate more dynamically than long-shelf items.',
                icon: 'nutrition-outline',
              },
              {
                title: '2. District Logistics Corridor',
                text: 'Consuming urban hubs (Colombo, Gampaha) include transit fuel premiums (+8-12%) compared to farmgate producing districts.',
                icon: 'trail-sign-outline',
              },
              {
                title: '3. Available Harvest Volume',
                text: 'Large commercial volume (>2,500kg) incurs wholesale lot clearance rates, while small batches retail higher.',
                icon: 'cube-outline',
              },
              {
                title: '4. Harvest Quality Grading',
                text: 'Sorted premium crops without pest defects or bruising attract +15-20% higher pricing from institutional supermarket chains.',
                icon: 'ribbon-outline',
              },
              {
                title: '5. Historical Market Trends',
                text: '14-day rolling price trends from Dambulla and Manning markets anchor our price elasticity model.',
                icon: 'stats-chart-outline',
              },
              {
                title: '6. Seasonal Cycles (Maha vs Yala)',
                text: 'Monsoon transitions impact crop arrivals, supply bottlenecks, and farmgate reserve values.',
                icon: 'rainy-outline',
              },
              {
                title: '7. Buyer Procurement Demand',
                text: 'Active buy requests and commercial purchasing bids directly inform our market tension index.',
                icon: 'cart-outline',
              },
            ].map((driver, index) => (
              <View key={index} style={styles.driverItem}>
                <View style={styles.driverIconBox}>
                  <Ionicons name={driver.icon as any} size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverTitle}>{driver.title}</Text>
                  <Text style={styles.driverText}>{driver.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  alertDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  badgeSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeSmallText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 10,
  },
  disclaimerIconBox: {
    marginTop: 2,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  quickNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  quickNavCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
  },
  quickNavIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickNavTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  quickNavSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  snapshotCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  snapshotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  snapshotCropName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  snapshotDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  snapshotPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
  },
  snapshotPriceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  snapshotPriceVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  snapshotPriceUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  snapshotRangeBox: {
    alignItems: 'flex-end',
  },
  snapshotRangeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  snapshotRangeVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  formIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  formSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 12,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipBtnActive: {
    backgroundColor: '#EAF6F0',
    borderColor: Colors.secondary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textDark,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  qualityBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qualityBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 4,
  },
  qualityTextActive: {
    color: Colors.white,
  },
  qualitySub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  qualitySubActive: {
    color: '#D1FAE5',
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  resultBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  resultCropTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 2,
  },
  resultTag: {
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  resultMainBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  resultPriceCol: {
    flex: 1,
  },
  resultDivider: {
    width: 1,
    backgroundColor: '#DCFCE7',
    marginHorizontal: 10,
  },
  resultValCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  resultPriceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  resultPriceNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  resultPricePerKg: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  resultSuggested: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 4,
  },
  resultTotalNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  resultQty: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  rangeBarContainer: {
    marginBottom: 16,
  },
  rangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rangeLabelText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  rangeLabelCenter: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  rangeTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'visible',
    justifyContent: 'center',
  },
  rangeFill: {
    height: '100%',
    width: '60%',
    backgroundColor: '#86EFAC',
    borderRadius: 4,
    marginLeft: '20%',
  },
  rangeThumb: {
    position: 'absolute',
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  factorsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  factorsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  factorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  factorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  factorName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  factorMultiplier: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  factorDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  sourceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  sourceText: {
    fontSize: 10,
    color: Colors.textSecondary,
    flex: 1,
  },
  explanationCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  explanationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  explanationSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  driverIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  driverTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  driverText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
