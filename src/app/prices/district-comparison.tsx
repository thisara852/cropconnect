import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { SelectModal } from '../../components/common/SelectModal';
import { usePrediction } from '../../context/PredictionContext';

export default function DistrictComparisonScreen() {
  const router = useRouter();
  const { supportedCrops, getDistrictComparisons } = usePrediction();
  const [selectedCrop, setSelectedCrop] = useState<string>('Big Onions');

  const cropOptions = supportedCrops.map(c => ({
    label: `${c.name} (${c.sinhalaName})`,
    value: c.name,
    subtitle: `${c.category} • Base LKR ${c.baselinePriceLkr}/kg`,
  }));

  const comparisonRecords = getDistrictComparisons(selectedCrop);

  // Highest and lowest
  const highest = comparisonRecords.find(r => r.isHighestPrice) || comparisonRecords[0];
  const lowest = comparisonRecords.find(r => r.isLowestPrice) || comparisonRecords[comparisonRecords.length - 1];
  const priceSpread = highest ? highest.avgPricePerKg - (lowest ? lowest.avgPricePerKg : 0) : 0;

  // Max price for proportional bar calculation
  const maxBarPrice = highest ? highest.avgPricePerKg * 1.05 : 400;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="District Price Comparison"
        subtitle="Wholesale market benchmarks across Sri Lankan provinces"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Crop Selector Card */}
        <View style={[styles.filterCard, Shadows.card]}>
          <SelectModal
            label="Compare Prices For Crop"
            value={selectedCrop}
            options={cropOptions}
            onSelect={setSelectedCrop}
            iconName="leaf-outline"
          />
        </View>

        {/* Highest & Lowest Highlight Cards */}
        <View style={styles.highlightRow}>
          <View style={[styles.highlightCard, { borderLeftColor: '#16A34A' }, Shadows.card]}>
            <View style={styles.highlightHeader}>
              <Ionicons name="arrow-up-circle" size={18} color="#16A34A" />
              <Text style={styles.highlightBadgeGreen}>HIGHEST MARKET</Text>
            </View>
            <Text style={styles.highlightDistrict}>{highest?.district || 'Colombo'}</Text>
            <Text style={styles.highlightPrice}>
              LKR {highest?.avgPricePerKg || 0} <Text style={styles.unitText}>/kg</Text>
            </Text>
            <Text style={styles.highlightSub}>{highest?.marketCentre}</Text>
          </View>

          <View style={[styles.highlightCard, { borderLeftColor: '#EA580C' }, Shadows.card]}>
            <View style={styles.highlightHeader}>
              <Ionicons name="arrow-down-circle" size={18} color="#EA580C" />
              <Text style={styles.highlightBadgeOrange}>LOWEST FARMGATE</Text>
            </View>
            <Text style={styles.highlightDistrict}>{lowest?.district || 'Matale'}</Text>
            <Text style={styles.highlightPrice}>
              LKR {lowest?.avgPricePerKg || 0} <Text style={styles.unitText}>/kg</Text>
            </Text>
            <Text style={styles.highlightSub}>{lowest?.marketCentre}</Text>
          </View>
        </View>

        {/* Inter-District Spread Insight Box */}
        <View style={styles.spreadBox}>
          <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.spreadTitle}>
              Inter-District Price Spread: LKR {priceSpread} /kg
            </Text>
            <Text style={styles.spreadDesc}>
              Transporting from {lowest?.district} to {highest?.district} offers an arbitrage spread of{' '}
              {lowest ? Math.round((priceSpread / lowest.avgPricePerKg) * 100) : 0}%. Deduct freight costs (~LKR 12-18/kg) to evaluate net returns.
            </Text>
          </View>
        </View>

        {/* District Price Comparison Bar Chart List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            All 12 District Wholesale Benchmarks ({selectedCrop})
          </Text>
          <Text style={styles.sectionSubtitle}>
            Sorted from highest urban consuming hubs to farmgate production centers
          </Text>
        </View>

        {comparisonRecords.map(item => {
          const barWidthPercent = Math.min(
            100,
            Math.max(25, Math.round((item.avgPricePerKg / maxBarPrice) * 100))
          );
          const isHigh = item.isHighestPrice;
          const isLow = item.isLowestPrice;

          return (
            <View key={item.district} style={[styles.districtCard, Shadows.card]}>
              <View style={styles.districtTopRow}>
                <View style={styles.districtNameGroup}>
                  <Text style={styles.districtTitle}>{item.district}</Text>
                  <Text style={styles.provinceText}>{item.province} Province</Text>
                </View>

                <View style={styles.priceGroup}>
                  <Text style={styles.avgPriceText}>LKR {item.avgPricePerKg} /kg</Text>
                  <Text style={styles.rangeText}>
                    Range: LKR {item.minPricePerKg} - {item.maxPricePerKg}
                  </Text>
                </View>
              </View>

              {/* Visual Proportion Bar */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${barWidthPercent}%`,
                      backgroundColor: isHigh
                        ? '#16A34A'
                        : isLow
                        ? '#EA580C'
                        : Colors.secondary,
                    },
                  ]}
                />
              </View>

              <View style={styles.districtBottomRow}>
                <View style={styles.marketHubRow}>
                  <Ionicons name="business-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.marketHubText} numberOfLines={1}>
                    {item.marketCentre}
                  </Text>
                </View>

                {isHigh && (
                  <View style={[styles.badgePill, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.badgePillText, { color: '#16A34A' }]}>Peak Price</Text>
                  </View>
                )}
                {isLow && (
                  <View style={[styles.badgePill, { backgroundColor: '#FFEDD5' }]}>
                    <Text style={[styles.badgePillText, { color: '#EA580C' }]}>Source Base</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
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
  highlightRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  highlightBadgeGreen: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  highlightBadgeOrange: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  highlightDistrict: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  highlightPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 2,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  highlightSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  spreadBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF6F0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  spreadTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  spreadDesc: {
    fontSize: 11,
    color: Colors.textDark,
    marginTop: 2,
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
    marginTop: 2,
  },
  districtCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  districtTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  districtNameGroup: {
    flex: 1,
  },
  districtTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  provinceText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  priceGroup: {
    alignItems: 'flex-end',
  },
  avgPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  rangeText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  barTrack: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  districtBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  marketHubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  marketHubText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
  },
});
