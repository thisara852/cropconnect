import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useFarmer } from '../../context/FarmerContext';
import { Colors, Shadows, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { CropCard } from '../../components/farmer/CropCard';
import { BuyerCard } from '../../components/farmer/BuyerCard';
import { StatCard } from '../../components/farmer/StatCard';

export default function FarmerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    crops,
    buyers,
    offers,
    unreadNotifsCount,
    totalActiveCrops,
    totalOffersReceived,
    refreshData,
    deleteCrop,
  } = useFarmer();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Filter crops if searching
  const displayedCrops = searchQuery.trim()
    ? crops.filter(
        (c) =>
          c.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.district.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : crops.slice(0, 3);

  const recommendedBuyers = buyers.slice(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.profileBrief}
          onPress={() => router.push('/(farmer)/profile' as any)}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1595956553066-fe24a8c33395?w=200&q=80',
            }}
            style={styles.avatar}
          />
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>ආයුබෝවන් • Welcome,</Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Farmer'}
            </Text>
            <Text style={styles.userLocation}>
              <Ionicons name="location-sharp" size={12} color={Colors.secondary} />{' '}
              {user?.village ? `${user.village}, ` : ''}
              {user?.district || 'Sri Lanka'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Notifications Icon with Badge */}
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/farmer/notifications' as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          {unreadNotifsCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadNotifsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops, buyers, districts..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/(farmer)/crops' as any)}
              style={styles.filterBtn}
            >
              <Ionicons name="options-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Metrics Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Active Crops"
            value={totalActiveCrops}
            subtitle="Listed on market"
            iconName="leaf"
            variant="green"
            onPress={() => router.push('/(farmer)/crops' as any)}
          />
          <StatCard
            label="Offers Received"
            value={totalOffersReceived}
            subtitle="From local buyers"
            iconName="pricetags"
            variant="orange"
            onPress={() => router.push('/(farmer)/crops' as any)}
          />
          <StatCard
            label="AI Fair Price"
            value="Active"
            subtitle="Market guidance"
            iconName="sparkles"
            variant="blue"
            onPress={() => router.push('/(farmer)/prices' as any)}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: '#EAF6F0' }]}
            onPress={() => router.push('/farmer/crop-add' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: Colors.secondary }]}>
              <Ionicons name="add" size={20} color={Colors.white} />
            </View>
            <Text style={styles.actionItemText}>Add Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: '#F0F5F2' }]}
            onPress={() => router.push('/(farmer)/crops' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: Colors.primary }]}>
              <Ionicons name="leaf" size={18} color={Colors.white} />
            </View>
            <Text style={styles.actionItemText}>My Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: '#EBF3FB' }]}
            onPress={() => router.push('/(farmer)/buyers' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: Colors.info }]}>
              <Ionicons name="people" size={18} color={Colors.white} />
            </View>
            <Text style={styles.actionItemText}>Find Buyers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: '#FEF4E8' }]}
            onPress={() => router.push('/(farmer)/prices' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: Colors.orangeDark }]}>
              <Ionicons name="trending-up" size={18} color={Colors.white} />
            </View>
            <Text style={styles.actionItemText}>Check Prices</Text>
          </TouchableOpacity>
        </View>

        {/* Phase 5: Location-Based Proximity & Map Banner */}
        <View style={[styles.mapPromoCard, Shadows.card]}>
          <View style={styles.mapPromoHeader}>
            <View style={styles.mapPromoIconBox}>
              <Ionicons name="map" size={20} color={Colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapPromoTitle}>Nearby Buyer Proximity Matcher</Text>
              <Text style={styles.mapPromoSubtitle}>
                Match buyers by Haversine transit distance and harvest demand
              </Text>
            </View>
          </View>
          <View style={styles.mapPromoBtnRow}>
            <TouchableOpacity
              style={styles.mapPromoPrimaryBtn}
              onPress={() => router.push('/farmer/nearby-buyers' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              <Text style={styles.mapPromoPrimaryText}>Match Nearby Buyers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapPromoOutlineBtn}
              onPress={() => router.push('/map' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="locate-outline" size={14} color={Colors.primary} />
              <Text style={styles.mapPromoOutlineText}>Agri Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Fair-Price Prediction Preview Banner */}
        <View style={[styles.aiPreviewCard, Shadows.card]}>
          <View style={styles.aiBadgeRow}>
            <View style={styles.aiPill}>
              <Ionicons name="sparkles" size={12} color={Colors.orangeDark} />
              <Text style={styles.aiPillText}>AI PRICE MATCHER</Text>
            </View>
            <Text style={styles.aiUpdatedText}>Updated Today</Text>
          </View>

          <Text style={styles.aiTitle}>Big Onion Farmgate Fair Rate: LKR 280/kg</Text>
          <Text style={styles.aiDesc}>
            Dambulla wholesale arrivals are down 12%. Hold for fair bids above LKR 270/kg.
          </Text>

          <TouchableOpacity
            style={styles.aiActionBtn}
            onPress={() => router.push('/(farmer)/prices' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.aiActionText}>Run AI Crop Price Valuation</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Nearby Recommended Buyers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Recommended Buyers</Text>
          <TouchableOpacity onPress={() => router.push('/(farmer)/buyers' as any)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recommendedBuyers.map((buyer) => (
          <BuyerCard
            key={buyer.id}
            buyer={buyer}
          />
        ))}

        {/* Latest Crop Listings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? 'Search Results' : 'My Recent Crop Listings'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(farmer)/crops' as any)}>
            <Text style={styles.seeAllText}>View All ({crops.length})</Text>
          </TouchableOpacity>
        </View>

        {displayedCrops.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="leaf-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Crop Listings Found</Text>
            <Text style={styles.emptyDesc}>
              Tap "Add Crop" to publish your first harvest lot to local buyers.
            </Text>
          </View>
        ) : (
          displayedCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onDelete={(id) => deleteCrop(id)}
            />
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textDark,
  },
  userLocation: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.error,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  notifBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textDark,
  },
  filterBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
    color: Colors.textDark,
  },
  seeAllText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.secondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickActionItem: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 6,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
  mapPromoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#C2E5D4',
    gap: Spacing.sm,
  },
  mapPromoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mapPromoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF6F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPromoTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textDark,
  },
  mapPromoSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  mapPromoBtnRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  mapPromoPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  mapPromoPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mapPromoOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  mapPromoOutlineText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  aiPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF4E7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  aiPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.orangeDark,
  },
  aiUpdatedText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  aiTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textDark,
  },
  aiDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  aiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 4,
    marginTop: 4,
  },
  aiActionText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textDark,
  },
  emptyDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
