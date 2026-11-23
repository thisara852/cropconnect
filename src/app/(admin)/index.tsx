import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    stats,
    farmers,
    buyers,
    crops,
    offers,
    complaints,
    isLoading,
    refreshData,
  } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const adminName = user?.name || 'Director General (Agri Oversight)';
  const adminDept = user?.adminDepartment || 'Ministry of Agriculture & Plantation Industries';

  // Category statistics calculation
  const totalCropsCount = crops.length || 1;
  const vegCount = crops.filter((c) => c.category === 'Vegetables').length;
  const fruitCount = crops.filter((c) => c.category === 'Fruits').length;
  const grainCount = crops.filter((c) => c.category === 'Grains & Paddy').length;
  const spiceCount = crops.filter((c) => c.category === 'Spices').length;
  const tuberCount = crops.filter((c) => c.category === 'Tubers & Roots').length;

  const totalUsers = farmers.length + buyers.length || 1;
  const farmerPct = Math.round((farmers.length / totalUsers) * 100);
  const buyerPct = 100 - farmerPct;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Admin Executive Top Bar */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.profileBrief}>
            <View style={styles.avatarWrap}>
              <Image
                source={{
                  uri:
                    user?.avatarUrl ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
                }}
                style={styles.avatar}
              />
              <View style={styles.shieldBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.titleCol}>
              <View style={styles.govTag}>
                <Text style={styles.govTagText}>GOV.LK PRIVILEGED PORTAL</Text>
              </View>
              <Text style={styles.adminName} numberOfLines={1}>
                {adminName}
              </Text>
              <Text style={styles.deptName} numberOfLines={1}>
                {adminDept}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/admin/complaints' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications" size={20} color="#FFFFFF" />
            {stats.pendingComplaints > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{stats.pendingComplaints}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={['#D97706']} />
        }
      >
        {/* Verification Alert Banner */}
        {stats.pendingVerifications > 0 && (
          <TouchableOpacity
            style={[styles.alertBanner, Shadows.card]}
            onPress={() => router.push('/admin/verifications' as any)}
            activeOpacity={0.9}
          >
            <View style={styles.alertIconCircle}>
              <Ionicons name="alert-circle" size={24} color="#D97706" />
            </View>
            <View style={styles.alertTextGroup}>
              <Text style={styles.alertTitle}>
                {stats.pendingVerifications} Commercial Buyer Verification{stats.pendingVerifications > 1 ? 's' : ''} Pending
              </Text>
              <Text style={styles.alertSubtitle}>
                Review corporate BRN documents and grant bidding clearance.
              </Text>
            </View>
            <View style={styles.alertActionBtn}>
              <Text style={styles.alertActionText}>Review</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Core KPI Metrics Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Platform Governance Overview</Text>
          <Text style={styles.liveBadge}>LIVE DATA</Text>
        </View>

        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, Shadows.card]}
            onPress={() => router.push('/(admin)/users' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EAF6F0' }]}>
              <Ionicons name="leaf" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.statVal}>{farmers.length}</Text>
            <Text style={styles.statLabel}>Total Farmers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, Shadows.card]}
            onPress={() => router.push('/(admin)/users' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#FDF4E7' }]}>
              <Ionicons name="business" size={20} color={Colors.orange} />
            </View>
            <Text style={styles.statVal}>{buyers.length}</Text>
            <Text style={styles.statLabel}>Total Buyers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, Shadows.card]}
            onPress={() => router.push('/(admin)/listings' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="cube" size={20} color="#0284C7" />
            </View>
            <Text style={styles.statVal}>{crops.length}</Text>
            <Text style={styles.statLabel}>Active Lots</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, Shadows.card]}
            onPress={() => router.push('/admin/offers' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="pricetag" size={20} color="#D97706" />
            </View>
            <Text style={styles.statVal}>{offers.length}</Text>
            <Text style={styles.statLabel}>Total Offers</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Hub */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Administrative Quick Actions</Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, Shadows.card]}
            onPress={() => router.push('/admin/verifications' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#D97706" />
            </View>
            <Text style={styles.actionBtnTitle}>Verify Buyers</Text>
            <Text style={styles.actionBtnDesc}>{stats.pendingVerifications} in queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, Shadows.card]}
            onPress={() => router.push('/admin/prices' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#EAF6F0' }]}>
              <Ionicons name="trending-up" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.actionBtnTitle}>Crop Prices</Text>
            <Text style={styles.actionBtnDesc}>District benchmarks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, Shadows.card]}
            onPress={() => router.push('/admin/offers' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="eye" size={20} color="#0284C7" />
            </View>
            <Text style={styles.actionBtnTitle}>Monitor Offers</Text>
            <Text style={styles.actionBtnDesc}>Read-only audit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, Shadows.card]}
            onPress={() => router.push('/admin/complaints' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="chatbubbles" size={20} color="#DC2626" />
            </View>
            <Text style={styles.actionBtnTitle}>Complaints</Text>
            <Text style={styles.actionBtnDesc}>{stats.pendingComplaints} unresolved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, Shadows.card]}
            onPress={() => router.push('/admin/announcements' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="megaphone" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.actionBtnTitle}>Announcements</Text>
            <Text style={styles.actionBtnDesc}>Broadcast updates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, Shadows.card]}
            onPress={() => router.push('/map' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="map" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.actionBtnTitle}>Agri Map</Text>
            <Text style={styles.actionBtnDesc}>National GIS overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, Shadows.card]}
            onPress={() => router.push('/(admin)/reports' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="pie-chart" size={20} color="#475569" />
            </View>
            <Text style={styles.actionBtnTitle}>Full Reports</Text>
            <Text style={styles.actionBtnDesc}>Analytical charts</Text>
          </TouchableOpacity>
        </View>

        {/* Visual Charts: User Demographics & Crop Categories */}
        <View style={[styles.chartCard, Shadows.card]}>
          <Text style={styles.chartTitle}>User Demographics Ratio</Text>
          <Text style={styles.chartSubtitle}>Active Agricultural Ecosystem Participants</Text>

          <View style={styles.ratioBarContainer}>
            <View style={[styles.ratioSegment, { flex: farmerPct, backgroundColor: Colors.secondary }]} />
            <View style={[styles.ratioSegment, { flex: buyerPct, backgroundColor: Colors.orange }]} />
          </View>

          <View style={styles.ratioLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
              <Text style={styles.legendLabel}>Farmers ({farmers.length})</Text>
              <Text style={styles.legendPct}>{farmerPct}%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.orange }]} />
              <Text style={styles.legendLabel}>Buyers ({buyers.length})</Text>
              <Text style={styles.legendPct}>{buyerPct}%</Text>
            </View>
          </View>
        </View>

        {/* Visual Charts: Supply by Crop Category */}
        <View style={[styles.chartCard, Shadows.card]}>
          <Text style={styles.chartTitle}>Crop Supply by Category</Text>
          <Text style={styles.chartSubtitle}>Harvest Volume Registered on Platform</Text>

          <View style={styles.categoryMeterList}>
            <View style={styles.meterRow}>
              <Text style={styles.meterName}>Vegetables</Text>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${(vegCount / totalCropsCount) * 100}%`, backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.meterVal}>{vegCount} lots</Text>
            </View>

            <View style={styles.meterRow}>
              <Text style={styles.meterName}>Tubers & Roots</Text>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${(tuberCount / totalCropsCount) * 100}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.meterVal}>{tuberCount} lots</Text>
            </View>

            <View style={styles.meterRow}>
              <Text style={styles.meterName}>Fruits</Text>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${(fruitCount / totalCropsCount) * 100}%`, backgroundColor: '#EC4899' }]} />
              </View>
              <Text style={styles.meterVal}>{fruitCount} lots</Text>
            </View>

            <View style={styles.meterRow}>
              <Text style={styles.meterName}>Spices</Text>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${(spiceCount / totalCropsCount) * 100}%`, backgroundColor: '#8B5CF6' }]} />
              </View>
              <Text style={styles.meterVal}>{spiceCount} lots</Text>
            </View>

            <View style={styles.meterRow}>
              <Text style={styles.meterName}>Grains & Paddy</Text>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${(grainCount / totalCropsCount) * 100}%`, backgroundColor: '#3B82F6' }]} />
              </View>
              <Text style={styles.meterVal}>{grainCount} lots</Text>
            </View>
          </View>
        </View>

        {/* Recent Audit Activities */}
        <View style={[styles.auditCard, Shadows.card]}>
          <Text style={styles.chartTitle}>Recent Platform Activity Audit</Text>

          <View style={styles.auditList}>
            <View style={styles.auditItem}>
              <View style={[styles.auditIcon, { backgroundColor: '#EAF6F0' }]}>
                <Ionicons name="checkmark" size={14} color={Colors.secondary} />
              </View>
              <View style={styles.auditCol}>
                <Text style={styles.auditDesc}>
                  Buyer <Text style={{ fontWeight: '700' }}>Lanka Fresh Supermarkets</Text> submitted an offer on <Text style={{ fontWeight: '700' }}>Big Onions</Text>
                </Text>
                <Text style={styles.auditTime}>24 minutes ago • Dambulla Hub</Text>
              </View>
            </View>

            <View style={styles.auditItem}>
              <View style={[styles.auditIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="document-text" size={14} color="#D97706" />
              </View>
              <View style={styles.auditCol}>
                <Text style={styles.auditDesc}>
                  <Text style={{ fontWeight: '700' }}>Ceylon Organic Exporters</Text> submitted BRN verification credentials
                </Text>
                <Text style={styles.auditTime}>2 hours ago • Pending Review</Text>
              </View>
            </View>

            <View style={styles.auditItem}>
              <View style={[styles.auditIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="leaf" size={14} color="#0284C7" />
              </View>
              <View style={styles.auditCol}>
                <Text style={styles.auditDesc}>
                  Farmer <Text style={{ fontWeight: '700' }}>Sarath Kumara</Text> published new lot of <Text style={{ fontWeight: '700' }}>Upcountry Carrots (2,500 kg)</Text>
                </Text>
                <Text style={styles.auditTime}>5 hours ago • Nuwara Eliya</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark Slate Admin Base
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  shieldBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#D97706',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  titleCol: {
    flex: 1,
  },
  govTag: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  govTagText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deptName: {
    fontSize: 11,
    color: '#94A3B8',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#DC2626',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  alertIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTextGroup: {
    flex: 1,
  },
  alertTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#92400E',
  },
  alertSubtitle: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  alertActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  alertActionText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  liveBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statVal: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionBtnTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  actionBtnDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
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
  ratioBarContainer: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  ratioSegment: {
    height: '100%',
  },
  ratioLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: '600',
  },
  legendPct: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  categoryMeterList: {
    gap: Spacing.sm,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  meterName: {
    width: 110,
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  meterTrack: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.background,
    borderRadius: 5,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 5,
  },
  meterVal: {
    width: 50,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'right',
  },
  auditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  auditList: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  auditIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  auditCol: {
    flex: 1,
  },
  auditDesc: {
    fontSize: FontSize.xs,
    color: Colors.text,
    lineHeight: 18,
  },
  auditTime: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
