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
import { SRI_LANKAN_DISTRICTS } from '../../constants/districts';
import { SRI_LANKAN_CROP_PRESETS } from '../../constants/crops';
import { farmerService } from '../../services/farmerService';

type Timeframe = 'daily' | 'weekly' | 'monthly';

export default function PriceHistoryScreen() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState('Big Onion (ලොකු ළූණු)');
  const [selectedDistrict, setSelectedDistrict] = useState('Anuradhapura');
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');

  const historyPoints = farmerService.getPriceHistory(selectedCrop, timeframe);

  const prices = historyPoints.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const cropOptions = SRI_LANKAN_CROP_PRESETS.map(p => ({
    label: p.cropName,
    value: p.cropName,
    subtitle: p.category,
  }));

  const districtOptions = SRI_LANKAN_DISTRICTS.map(d => ({
    label: d.name,
    value: d.name,
    subtitle: `${d.sinhalaName} • ${d.tamilName}`,
    meta: d.province,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Price History & Analytics"
        subtitle="Wholesale market trends from Sri Lankan economic centers"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Shortcut Banner to Comprehensive Price Audit */}
        <TouchableOpacity
          style={styles.auditBanner}
          onPress={() => router.push('/prices/history' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.auditIconBox}>
            <Ionicons name="documents-outline" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.auditTitle}>Explore Full Market Recorded Audit</Text>
            <Text style={styles.auditSub}>
              Searchable verified bulletins, date filtering, and source citations
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>

        {/* Selectors Card */}
        <View style={styles.filterCard}>
          <SelectModal
            label="Selected Crop"
            value={selectedCrop}
            options={cropOptions}
            onSelect={setSelectedCrop}
            iconName="leaf-outline"
          />

          <SelectModal
            label="Economic Center / District"
            value={selectedDistrict}
            options={districtOptions}
            onSelect={setSelectedDistrict}
            iconName="location-outline"
          />

          {/* Timeframe Filter Tabs */}
          <View style={styles.timeframeTabs}>
            {(['daily', 'weekly', 'monthly'] as const).map(tf => {
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
          <View style={[styles.metricCard, { borderTopColor: Colors.secondary }]}>
            <Text style={styles.metricLabel}>Average Price</Text>
            <Text style={styles.metricPrice}>
              LKR {avgPrice} <Text style={styles.metricUnit}>/kg</Text>
            </Text>
            <Text style={styles.metricSub}>Mean benchmark</Text>
          </View>

          <View style={[styles.metricCard, { borderTopColor: Colors.orangeDark }]}>
            <Text style={styles.metricLabel}>Highest Recorded</Text>
            <Text style={[styles.metricPrice, { color: Colors.orangeDark }]}>
              LKR {maxPrice} <Text style={styles.metricUnit}>/kg</Text>
            </Text>
            <Text style={styles.metricSub}>Peak wholesale rate</Text>
          </View>

          <View style={[styles.metricCard, { borderTopColor: Colors.primary }]}>
            <Text style={styles.metricLabel}>Lowest Floor</Text>
            <Text style={[styles.metricPrice, { color: Colors.primary }]}>
              LKR {minPrice} <Text style={styles.metricUnit}>/kg</Text>
            </Text>
            <Text style={styles.metricSub}>Trough harvest rate</Text>
          </View>
        </View>

        {/* Visual Price Trend Chart */}
        <View style={[styles.chartCard, Shadows.card]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Historical Farmgate Price Curve</Text>
              <Text style={styles.chartSub}>
                {selectedCrop} in {selectedDistrict} ({timeframe} view)
              </Text>
            </View>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={14} color={Colors.secondary} />
              <Text style={styles.trendBadgeText}>+6.8% Upward</Text>
            </View>
          </View>

          {/* Bar Chart Visualization */}
          <View style={styles.barsContainer}>
            {historyPoints.map((point, index) => {
              // Calculate height percentage relative to max price
              const heightPct = Math.round(((point.price - minPrice * 0.7) / (maxPrice - minPrice * 0.7)) * 100);
              const isLatest = index === historyPoints.length - 1;

              return (
                <View key={index} style={styles.barColumn}>
                  <Text style={styles.barPriceText}>{point.price}</Text>

                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${Math.max(heightPct, 15)}%` },
                        isLatest && styles.barFillLatest,
                      ]}
                    />
                  </View>

                  <Text style={[styles.barLabelText, isLatest && styles.barLabelLatest]}>
                    {point.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.chartFooter}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.chartFooterText}>
              Prices in Sri Lankan Rupees (LKR/kg). Indexed daily from regional wholesale centers.
            </Text>
          </View>
        </View>

        {/* Market Insights Box */}
        <View style={styles.insightsCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb-outline" size={18} color={Colors.orangeDark} />
            <Text style={styles.insightTitle}>Market Intelligence Note</Text>
          </View>
          <Text style={styles.insightBody}>
            {selectedCrop} experienced sustained buying demand across {selectedDistrict}.
            Seasonal arrival peak is projected within 10 days, suggesting optimal farmer selling window
            is during the current pricing plateau.
          </Text>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 16,
  },
  filterCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeframeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F0F5F2',
    padding: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  tfTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tfTabActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 3,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.secondary,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  metricSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  chartSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4EC',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barPriceText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  barTrack: {
    width: 22,
    height: 130,
    backgroundColor: '#F0F4EC',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#93C5AA',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barFillLatest: {
    backgroundColor: Colors.secondary,
  },
  barLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 6,
  },
  barLabelLatest: {
    color: Colors.primary,
    fontWeight: '800',
  },
  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  chartFooterText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
  },
  insightsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  insightBody: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  auditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6F0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  auditIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  auditSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
