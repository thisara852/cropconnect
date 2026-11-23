import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '../../context/AdminContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function AdminReportsScreen() {
  const { stats, farmers, buyers, crops, offers } = useAdmin();

  // District distribution sample aggregations
  const farmerDistricts = [
    { district: 'Dambulla', count: 480, pct: 34 },
    { district: 'Anuradhapura', count: 320, pct: 23 },
    { district: 'Nuwara Eliya', count: 290, pct: 20 },
    { district: 'Badulla', count: 180, pct: 13 },
    { district: 'Jaffna', count: 150, pct: 10 },
  ];

  const buyerDistricts = [
    { district: 'Colombo (Retail & HQ)', count: 180, pct: 47 },
    { district: 'Matale (Dambulla DEC)', count: 95, pct: 25 },
    { district: 'Gampaha (Export EPZ)', count: 52, pct: 14 },
    { district: 'Hambantota (Processing)', count: 35, pct: 9 },
    { district: 'Kandy (Regional Supply)', count: 18, pct: 5 },
  ];

  const monthlyTrends = [
    { month: 'January 2026', farmers: 410, buyers: 90, deals: 320 },
    { month: 'February 2026', farmers: 580, buyers: 140, deals: 490 },
    { month: 'March 2026 (Maha)', farmers: 850, buyers: 210, deals: 780 },
  ];

  const popularCrops = [
    { name: 'Big Onions (Dambulla Red)', volume: '45,000 kg', avgPrice: 'LKR 275/kg', share: 28 },
    { name: 'Upcountry Carrots', volume: '38,000 kg', avgPrice: 'LKR 210/kg', share: 24 },
    { name: 'Jaffna Red Onions', volume: '29,000 kg', avgPrice: 'LKR 350/kg', share: 18 },
    { name: 'Nuwara Eliya Potatoes', volume: '26,500 kg', avgPrice: 'LKR 290/kg', share: 17 },
    { name: 'Green Chillies', volume: '21,000 kg', avgPrice: 'LKR 420/kg', share: 13 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agricultural Market Intelligence</Text>
        <Text style={styles.headerSubtitle}>
          Macroeconomic harvest trends, supply distributions & fair-price indices
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Demonstration Data Banner */}
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle" size={18} color="#0284C7" />
          <Text style={styles.demoText}>
            <Text style={{ fontWeight: '700' }}>Academic & Evaluation Notice:</Text> Platform metrics combine active local database state with aggregated Sri Lankan baseline demonstration statistics.
          </Text>
        </View>

        {/* Executive Summary Quadrant */}
        <View style={styles.quadGrid}>
          <View style={[styles.quadCard, Shadows.card]}>
            <Text style={styles.quadVal}>{farmers.length.toLocaleString()}</Text>
            <Text style={styles.quadLabel}>Producers Registered</Text>
            <Text style={styles.quadTrend}>↑ +28% this quarter</Text>
          </View>

          <View style={[styles.quadCard, Shadows.card]}>
            <Text style={[styles.quadVal, { color: Colors.orange }]}>{buyers.length.toLocaleString()}</Text>
            <Text style={styles.quadLabel}>Commercial Buyers</Text>
            <Text style={styles.quadTrend}>↑ +15% this quarter</Text>
          </View>

          <View style={[styles.quadCard, Shadows.card]}>
            <Text style={[styles.quadVal, { color: Colors.secondary }]}>{crops.length.toLocaleString()}</Text>
            <Text style={styles.quadLabel}>Active Harvest Lots</Text>
            <Text style={styles.quadTrend}>{stats.totalVolumeListedKg.toLocaleString()} kg listed</Text>
          </View>

          <View style={[styles.quadCard, Shadows.card]}>
            <Text style={[styles.quadVal, { color: '#0284C7' }]}>{offers.length.toLocaleString()}</Text>
            <Text style={styles.quadLabel}>Bilateral Offers</Text>
            <Text style={styles.quadTrend}>LKR 18.4M volume</Text>
          </View>
        </View>

        {/* District-wise Farmer Distribution */}
        <View style={[styles.chartCard, Shadows.card]}>
          <Text style={styles.chartTitle}>Farmer Geographic Distribution</Text>
          <Text style={styles.chartSubtitle}>Regional production cluster concentrations</Text>

          <View style={styles.distList}>
            {farmerDistricts.map((d) => (
              <View key={d.district} style={styles.distRow}>
                <Text style={styles.distName}>{d.district}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${d.pct}%`, backgroundColor: Colors.secondary }]} />
                </View>
                <Text style={styles.distVal}>{d.count} ({d.pct}%)</Text>
              </View>
            ))}
          </View>
        </View>

        {/* District-wise Buyer Distribution */}
        <View style={[styles.chartCard, Shadows.card]}>
          <Text style={styles.chartTitle}>Commercial Buyer Sourcing Hubs</Text>
          <Text style={styles.chartSubtitle}>Wholesale terminal and export depot locations</Text>

          <View style={styles.distList}>
            {buyerDistricts.map((d) => (
              <View key={d.district} style={styles.distRow}>
                <Text style={styles.distName}>{d.district}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${d.pct}%`, backgroundColor: Colors.orange }]} />
                </View>
                <Text style={styles.distVal}>{d.count} ({d.pct}%)</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Most Popular Sri Lankan Crops */}
        <View style={[styles.chartCard, Shadows.card]}>
          <Text style={styles.chartTitle}>Most Popular Traded Crops</Text>
          <Text style={styles.chartSubtitle}>Highest transaction volume on CROPCONNECT</Text>

          <View style={styles.popularList}>
            {popularCrops.map((c, i) => (
              <View key={i} style={styles.popularRow}>
                <View style={styles.popularIndexCircle}>
                  <Text style={styles.popularIndexText}>#{i + 1}</Text>
                </View>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularName}>{c.name}</Text>
                  <Text style={styles.popularVolume}>Volume: {c.volume} • Benchmark: {c.avgPrice}</Text>
                </View>
                <View style={styles.popularTrackBox}>
                  <View style={[styles.popularBar, { width: `${c.share * 2.5}%` }]} />
                  <Text style={styles.popularShareText}>{c.share}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Registration Trends */}
        <View style={[styles.chartCard, Shadows.card]}>
          <Text style={styles.chartTitle}>Quarterly Growth Trends (Q1 2026)</Text>
          <Text style={styles.chartSubtitle}>Platform adoption velocity during Maha agricultural harvest</Text>

          <View style={styles.trendTable}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHead, { flex: 1.5 }]}>Period</Text>
              <Text style={styles.tableHead}>Farmers</Text>
              <Text style={styles.tableHead}>Buyers</Text>
              <Text style={styles.tableHead}>Trades</Text>
            </View>

            {monthlyTrends.map((t, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: '700' }]}>{t.month}</Text>
                <Text style={[styles.tableCell, { color: Colors.secondary }]}>+{t.farmers}</Text>
                <Text style={[styles.tableCell, { color: Colors.orange }]}>+{t.buyers}</Text>
                <Text style={[styles.tableCell, { fontWeight: '700' }]}>{t.deals}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  scrollContent: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  demoText: {
    flex: 1,
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
  },
  quadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quadCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quadVal: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  quadLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quadTrend: {
    fontSize: 10,
    color: Colors.secondary,
    fontWeight: '700',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  chartSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  distList: {
    gap: Spacing.sm,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  distName: {
    width: 130,
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.background,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  distVal: {
    width: 75,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'right',
  },
  popularList: {
    gap: Spacing.md,
  },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  popularIndexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  popularInfo: {
    flex: 1,
  },
  popularName: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  popularVolume: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  popularTrackBox: {
    width: 80,
    alignItems: 'flex-end',
  },
  popularBar: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  popularShareText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  trendTable: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHead: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
});
