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
import { useBuyer } from '../../context/BuyerContext';
import { Colors, Shadows } from '../../constants/theme';
import { BuyerCropCard } from '../../components/buyer/BuyerCropCard';
import { FarmerCard } from '../../components/buyer/FarmerCard';
import { BuyerStatCard } from '../../components/buyer/BuyerStatCard';

const POPULAR_SL_CROPS = [
  { name: 'Rice / Paddy', icon: 'nutrition', color: '#D97706' },
  { name: 'Tomatoes', icon: 'flower', color: '#DC2626' },
  { name: 'Onions', icon: 'cube', color: '#B45309' },
  { name: 'Carrots', icon: 'leaf', color: '#EA580C' },
  { name: 'Potatoes', icon: 'layers', color: '#854D0E' },
  { name: 'Green Chillies', icon: 'flash', color: '#16A34A' },
  { name: 'Bananas', icon: 'sunny', color: '#CA8A04' },
];

export default function BuyerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    crops,
    farmers,
    unreadNotifsCount,
    totalAvailableCropsCount,
    sentOffersCount,
    acceptedOffersCount,
    activeRequirementsCount,
    refreshData,
  } = useBuyer();

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const recentCrops = crops.slice(0, 3);
  const recommendedFarmers = farmers.slice(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.profileBrief}
          onPress={() => router.push('/(buyer)/profile' as any)}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.titleInfo}>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>Welcome,</Text>
              <View style={styles.buyerBadge}>
                <Text style={styles.buyerBadgeText}>COMMERCIAL BUYER</Text>
              </View>
            </View>
            <Text style={styles.businessName} numberOfLines={1}>
              {user?.businessName || user?.name || 'Lanka Fresh Supermarkets'}
            </Text>
            <Text style={styles.locationText}>
              <Ionicons name="location" size={11} color={Colors.textMuted} /> {user?.district || 'Colombo Hub'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Notifications Icon with Badge */}
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/buyer/notifications' as any)}
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
            placeholder="Search farm crops, districts, suppliers..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => router.push('/(buyer)/browse' as any)}
          />
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => router.push('/(buyer)/browse' as any)}
          >
            <Ionicons name="options-outline" size={18} color={Colors.orangeDark} />
          </TouchableOpacity>
        </View>

        {/* Dashboard 4 Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryRow}>
            <BuyerStatCard
              label="Available Crops"
              value={totalAvailableCropsCount}
              subtitle="Live on market"
              iconName="leaf"
              variant="green"
              onPress={() => router.push('/(buyer)/browse' as any)}
            />
            <BuyerStatCard
              label="Sent Offers"
              value={sentOffersCount}
              subtitle="Pending response"
              iconName="pricetags"
              variant="orange"
              onPress={() => router.push('/(buyer)/offers' as any)}
            />
          </View>

          <View style={styles.summaryRow}>
            <BuyerStatCard
              label="Accepted Bids"
              value={acceptedOffersCount}
              subtitle="Ready for dispatch"
              iconName="checkmark-done-circle"
              variant="purple"
              onPress={() => router.push('/(buyer)/offers' as any)}
            />
            <BuyerStatCard
              label="Purchase Reqs"
              value={activeRequirementsCount}
              subtitle="Active demands"
              iconName="document-text"
              variant="blue"
              onPress={() => router.push('/(buyer)/requirements' as any)}
            />
          </View>
        </View>

        {/* Quick Actions (4 Buttons) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: '#EAF6F0' }]}
            onPress={() => router.push('/(buyer)/browse' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: Colors.secondary }]}>
              <Ionicons name="grid" size={18} color={Colors.white} />
            </View>
            <Text style={styles.actionItemText}>Browse Crops</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: '#FEF4E8' }]}
            onPress={() => router.push('/buyer/farmers' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: Colors.orangeDark }]}>
              <Ionicons name="people" size={18} color={Colors.white} />
            </View>
            <Text style={styles.actionItemText}>Find Farmers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: '#EBF3FB' }]}
            onPress={() => router.push('/buyer/requirement-post' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: Colors.info }]}>
              <Ionicons name="add-circle" size={18} color={Colors.white} />
            </View>
            <Text style={styles.actionItemText}>Post Request</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionItem, { backgroundColor: '#F3E8FF' }]}
            onPress={() => router.push('/(buyer)/offers' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#7C3AED' }]}>
              <Ionicons name="pricetags" size={18} color={Colors.white} />
            </View>
            <Text style={styles.actionItemText}>My Offers</Text>
          </TouchableOpacity>
        </View>

        {/* Phase 5: Location-Based Proximity & Map Banner */}
        <View style={[styles.mapPromoCard, Shadows.card]}>
          <View style={styles.mapPromoHeader}>
            <View style={styles.mapPromoIconBox}>
              <Ionicons name="map" size={20} color={Colors.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapPromoTitle}>Nearby Farmer Proximity Matcher</Text>
              <Text style={styles.mapPromoSubtitle}>
                Match farmgate lots by transport transit radius and target pricing
              </Text>
            </View>
          </View>
          <View style={styles.mapPromoBtnRow}>
            <TouchableOpacity
              style={styles.mapPromoPrimaryBtn}
              onPress={() => router.push('/buyer/nearby-farmers' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              <Text style={styles.mapPromoPrimaryText}>Match Farmgate Crops</Text>
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

        {/* Popular Sri Lankan Crops Horizontal Chips */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Popular Crops in Sri Lanka</Text>
          <TouchableOpacity onPress={() => router.push('/(buyer)/browse' as any)}>
            <Text style={styles.seeAllText}>Browse All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularCropsScroll}
        >
          {POPULAR_SL_CROPS.map((crop, i) => (
            <TouchableOpacity
              key={i}
              style={styles.popularCropChip}
              onPress={() => router.push('/(buyer)/browse' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.cropIconCircle, { backgroundColor: `${crop.color}15` }]}>
                <Ionicons name={crop.icon as any} size={16} color={crop.color} />
              </View>
              <Text style={styles.popularCropName}>{crop.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recently Added Crop Listings */}
        <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
          <View>
            <Text style={styles.sectionTitle}>Recently Added Crop Listings</Text>
            <Text style={styles.sectionSubtitle}>Direct farm gate listings from Sri Lankan growers</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(buyer)/browse' as any)}>
            <Text style={styles.seeAllText}>See All ({crops.length})</Text>
          </TouchableOpacity>
        </View>

        {recentCrops.length > 0 ? (
          recentCrops.map(crop => <BuyerCropCard key={crop.id} crop={crop} />)
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="leaf-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No harvest listings available</Text>
          </View>
        )}

        {/* Recommended Farmers */}
        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <View>
            <Text style={styles.sectionTitle}>Recommended Farmers</Text>
            <Text style={styles.sectionSubtitle}>Verified growers with recurring supply capacity</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/buyer/farmers' as any)}>
            <Text style={styles.seeAllText}>View All ({farmers.length})</Text>
          </TouchableOpacity>
        </View>

        {recommendedFarmers.map(farmer => (
          <FarmerCard key={farmer.id} farmer={farmer} />
        ))}
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FCD7A8',
    backgroundColor: '#FEF4E8',
  },
  titleInfo: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  buyerBadge: {
    backgroundColor: '#FEF4E8',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCD7A8',
  },
  buyerBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.orangeDark,
    letterSpacing: 0.5,
  },
  businessName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 8,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },
  filterBtn: {
    padding: 4,
  },
  summaryGrid: {
    gap: 10,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickActionItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  popularCropsScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  popularCropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularCropName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 6,
  },
  mapPromoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 12,
  },
  mapPromoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mapPromoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FDF4E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPromoTitle: {
    fontSize: 14,
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
    gap: 8,
  },
  mapPromoPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
});
