import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { SelectModal } from '../../components/common/SelectModal';
import { SRI_LANKAN_DISTRICTS } from '../../constants/districts';
import { usePrediction } from '../../context/PredictionContext';

type Timeframe = 'daily' | 'weekly' | 'monthly';
type SortOrder = 'date_desc' | 'price_asc' | 'price_desc';

export default function PriceHistoryScreen() {
  const { supportedCrops, getPriceTrends, getRecordedPrices } = usePrediction();

  const [selectedCrop, setSelectedCrop] = useState<string>('Big Onions');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Matale');
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOrder>('date_desc');

  const cropOptions = supportedCrops.map(c => ({
    label: `${c.name} (${c.sinhalaName})`,
    value: c.name,
    subtitle: `${c.category} • Base LKR ${c.baselinePriceLkr}/kg`,
  }));

  const districtOptions = SRI_LANKAN_DISTRICTS.map(d => ({
    label: d.name,
    value: d.name,
    subtitle: `${d.sinhalaName} • ${d.province} Province`,
  }));

  const trendData = getPriceTrends(selectedCrop, selectedDistrict, timeframe);
  const recordedPrices = getRecordedPrices({
    cropName: searchQuery ? undefined : selectedCrop,
    district: searchQuery ? undefined : selectedDistrict,
    searchQuery: searchQuery || undefined,
    sortBy,
  });

  // Calculate highest price for trend bar scaling
  const maxTrendPrice = trendData.highestPrice ? trendData.highestPrice * 1.1 : 350;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Price History & Trends"
        subtitle="Historical wholesale audit records and market price movements"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Selectors Card */}
        <View style={[styles.filterCard, Shadows.card]}>
          <SelectModal
            label="Selected Crop"
            value={selectedCrop}
            options={cropOptions}
            onSelect={setSelectedCrop}
            iconName="leaf-outline"
          />

          <SelectModal
            label="District / Economic Center"
            value={selectedDistrict}
            options={districtOptions}
            onSelect={setSelectedDistrict}
            iconName="location-outline"
          />

          {/* Timeframe Filter Tabs */}
          <View style={styles.timeframeTabs}>
            {(['daily', 'weekly', 'monthly'] as Timeframe[]).map(tf => {
              const active = timeframe === tf;
              return (
                <TouchableOpacity
                  key={tf}
                  style={[styles.tfTab, active && styles.tfTabActive]}
                  onPress={() => setTimeframe(tf)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tfTabText, active && styles.tfTabTextActive]}>
                    {tf === 'daily' ? '7 Days' : tf === 'weekly' ? '4 Weeks' : '6 Months'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* High, Low, Average Stats Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { borderTopColor: Colors.secondary }, Shadows.card]}>
            <Text style={styles.metricLabel}>Average Price</Text>
            <Text style={styles.metricPrice}>
              LKR {trendData.avgPrice} <Text style={styles.metricUnit}>/kg</Text>
            </Text>
            <Text style={styles.metricSub}>Mean period benchmark</Text>
          </View>

          <View style={[styles.metricCard, { borderTopColor: '#16A34A' }, Shadows.card]}>
            <Text style={styles.metricLabel}>Highest Recorded</Text>
            <Text style={[styles.metricPrice, { color: '#16A34A' }]}>
              LKR {trendData.highestPrice} <Text style={styles.metricUnit}>/kg</Text>
            </Text>
            <Text style={styles.metricSub}>Peak wholesale rate</Text>
          </View>

          <View style={[styles.metricCard, { borderTopColor: '#DC2626' }, Shadows.card]}>
            <Text style={styles.metricLabel}>Lowest Floor</Text>
            <Text style={[styles.metricPrice, { color: '#DC2626' }]}>
              LKR {trendData.lowestPrice} <Text style={styles.metricUnit}>/kg</Text>
            </Text>
            <Text style={styles.metricSub}>Lowest recorded trade</Text>
          </View>
        </View>

        {/* Visual Trend Chart Card */}
        <View style={[styles.chartCard, Shadows.card]}>
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={styles.chartTitle}>Price Movement Curve</Text>
              <Text style={styles.chartSubtitle}>
                {timeframe === 'daily'
                  ? 'Daily wholesale fluctuation (Past 7 Days)'
                  : timeframe === 'weekly'
                  ? 'Weekly average clearing price (Past 4 Weeks)'
                  : 'Monthly seasonal progression (Past 6 Months)'}
              </Text>
            </View>
            <View style={styles.chartTag}>
              <Text style={styles.chartTagText}>{selectedDistrict}</Text>
            </View>
          </View>

          {/* Bar Chart Representation */}
          <View style={styles.barChartContainer}>
            {trendData.points.map((pt, idx) => {
              const heightPct = Math.min(
                100,
                Math.max(20, Math.round((pt.price / maxTrendPrice) * 100))
              );
              return (
                <View key={idx} style={styles.barCol}>
                  <Text style={styles.barPriceVal}>{pt.price}</Text>
                  <View style={styles.barOuter}>
                    <View style={[styles.barInner, { height: `${heightPct}%` }]} />
                  </View>
                  <Text style={styles.barLabel}>{pt.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recorded Historical Prices Table / Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recorded Market Price Audit</Text>
          <Text style={styles.sectionSubtitle}>
            Official bulletins and verified transaction records ({recordedPrices.length} records)
          </Text>
        </View>

        {/* Search & Sort Bar */}
        <View style={styles.searchSortRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crop, district, or bulletin..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Sort Buttons */}
          <View style={styles.sortBtnRow}>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'date_desc' && styles.sortBtnActive]}
              onPress={() => setSortBy('date_desc')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortBtnText, sortBy === 'date_desc' && styles.sortBtnTextActive]}>
                Date
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'price_desc' && styles.sortBtnActive]}
              onPress={() => setSortBy(sortBy === 'price_desc' ? 'price_asc' : 'price_desc')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sortBtnText,
                  (sortBy === 'price_desc' || sortBy === 'price_asc') && styles.sortBtnTextActive,
                ]}
              >
                Price {sortBy === 'price_desc' ? '↓' : '↑'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {recordedPrices.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.card]}>
            <Ionicons name="document-text-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Historical Records Found</Text>
            <Text style={styles.emptyDesc}>Try clearing your search query or selecting another crop.</Text>
          </View>
        ) : (
          recordedPrices.map(rec => (
            <View key={rec.id} style={[styles.recordCard, Shadows.card]}>
              <View style={styles.recordTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recordCropName}>{rec.cropName}</Text>
                  <Text style={styles.recordDistrict}>
                    {rec.district} • {rec.category}
                  </Text>
                </View>

                <View style={styles.recordPriceBox}>
                  <Text style={styles.recordPrice}>LKR {rec.marketPricePerKg} /kg</Text>
                  <Text style={styles.recordRange}>
                    LKR {rec.minPricePerKg} - {rec.maxPricePerKg}
                  </Text>
                </View>
              </View>

              <View style={styles.recordBottomRow}>
                <View style={styles.sourceRow}>
                  <Ionicons name="newspaper-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.sourceText} numberOfLines={1}>
                    {rec.dataSource}
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  {rec.isVerifiedGovt && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={10} color="#16A34A" />
                      <Text style={styles.verifiedText}>Govt Benchmark</Text>
                    </View>
                  )}
                  <Text style={styles.recordDateText}>{rec.recordedDate}</Text>
                </View>
              </View>
            </View>
          ))
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
    marginBottom: 14,
  },
  timeframeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginTop: 8,
  },
  tfTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tfTabActive: {
    backgroundColor: Colors.white,
    ...Shadows.card,
  },
  tfTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tfTabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    borderTopWidth: 3,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metricPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 2,
  },
  metricUnit: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metricSub: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  chartSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chartTag: {
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 16,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barPriceVal: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  barOuter: {
    width: 16,
    height: 90,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barInner: {
    width: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 10,
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
  searchSortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.textDark,
  },
  sortBtnRow: {
    flexDirection: 'row',
    gap: 4,
  },
  sortBtn: {
    paddingHorizontal: 10,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
  },
  sortBtnTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recordCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  recordTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordCropName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  recordDistrict: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  recordPriceBox: {
    alignItems: 'flex-end',
  },
  recordPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  recordRange: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  recordBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  sourceText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  recordDateText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
