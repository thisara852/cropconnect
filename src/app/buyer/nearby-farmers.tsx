import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBuyer } from '../../context/BuyerContext';
import { useLocation } from '../../context/LocationContext';
import { locationService } from '../../services/locationService';
import { MatchTier } from '../../types/location';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function NearbyFarmersMatchingScreen() {
  const router = useRouter();
  const { crops, requirements } = useBuyer();
  const { userLocation } = useLocation();

  const [selectedReqId, setSelectedReqId] = useState<string>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(100);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active requirement reference
  const activeReq = requirements.find((r) => r.id === selectedReqId);

  const matchedCrops = useMemo(() => {
    const requirementForMatching = activeReq
      ? {
          cropName: activeReq.cropName,
          category: activeReq.category,
          quantityKg: activeReq.quantityKg,
          targetPricePerKg: activeReq.targetPricePerKg,
          preferredDistrict: activeReq.preferredDistrict,
          coords: locationService.getDistrictCoordinates(activeReq.preferredDistrict),
        }
      : {
          cropName: searchQuery,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          preferredDistrict: userLocation.district || 'Colombo',
          coords: userLocation.coords,
        };

    const rawMatches = locationService.matchFarmersForBuyer(requirementForMatching, crops);

    return rawMatches.filter((match) => {
      const c = match.item;
      const matchesSearch =
        c.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesDistance = match.distanceKm === null || match.distanceKm <= maxDistanceKm;

      return matchesSearch && matchesCategory && matchesDistance;
    });
  }, [activeReq, crops, userLocation, searchQuery, selectedCategory, maxDistanceKm]);

  const getTierBadge = (tier: MatchTier) => {
    switch (tier) {
      case 'Excellent Match':
        return { bg: '#EAF6F0', text: Colors.secondary, border: '#C2E5D4' };
      case 'Good Match':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {});
    }
  };

  const handleDirections = (crop: any) => {
    const coords = locationService.getDistrictCoordinates(crop.district);
    locationService.openExternalMaps(coords, `${crop.cropName} - ${crop.farmerName}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>Nearby Farmer Matcher</Text>
            <Text style={styles.headerSubtitle}>
              Rule-based farmgate supply matching for commercial buyers
            </Text>
          </View>
          <TouchableOpacity
            style={styles.mapViewBtn}
            onPress={() => router.push('/map' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="map" size={16} color="#FFFFFF" />
            <Text style={styles.mapViewBtnText}>Map</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop name, farmer, or district..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Requirement Matching Strip */}
      <View style={styles.reqStrip}>
        <Text style={styles.stripLabel}>MATCH AGAINST REQUIREMENT:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reqChips}>
          <TouchableOpacity
            style={[styles.reqChip, selectedReqId === 'all' && styles.reqChipActive]}
            onPress={() => setSelectedReqId('all')}
          >
            <Text style={[styles.reqChipText, selectedReqId === 'all' && styles.reqChipTextActive]}>
              All Available Crops ({crops.length})
            </Text>
          </TouchableOpacity>

          {requirements.map((r) => {
            const isSel = selectedReqId === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.reqChip, isSel && styles.reqChipActive]}
                onPress={() => setSelectedReqId(r.id)}
              >
                <Text style={[styles.reqChipText, isSel && styles.reqChipTextActive]}>
                  {r.cropName} ({r.quantityKg} kg @ LKR {r.targetPricePerKg})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter Horizontal Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[25, 50, 100, 200].map((dist) => {
            const isSel = maxDistanceKm === dist;
            return (
              <TouchableOpacity
                key={dist}
                style={[styles.filterChip, isSel && styles.filterChipActive]}
                onPress={() => setMaxDistanceKm(dist)}
              >
                <Text style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>
                  Within {dist} km
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Match Results List */}
      <FlatList
        data={matchedCrops}
        keyExtractor={(item) => item.item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const crop = item.item;
          const tier = getTierBadge(item.matchTier);

          return (
            <View style={[styles.matchCard, Shadows.card]}>
              {/* Header with Crop Image, Name, and Match Pill */}
              <View style={styles.cardHeader}>
                <Image source={{ uri: crop.imageUrl }} style={styles.cropImage} />

                <View style={styles.cropDetails}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cropName} numberOfLines={1}>
                      {crop.cropName}
                    </Text>
                    <View style={[styles.tierPill, { backgroundColor: tier.bg, borderColor: tier.border }]}>
                      <Text style={[styles.tierScore, { color: tier.text }]}>{item.matchScore}%</Text>
                      <Text style={[styles.tierLabel, { color: tier.text }]}>{item.matchTier}</Text>
                    </View>
                  </View>

                  <Text style={styles.farmerSub}>
                    Farmer: <Text style={{ fontWeight: '700' }}>{crop.farmerName}</Text> • {crop.village ? `${crop.village}, ` : ''}{crop.district}
                  </Text>

                  <View style={styles.distanceBadge}>
                    <Ionicons name="navigate-outline" size={13} color={Colors.primary} />
                    <Text style={styles.distanceBadgeText}>{item.distanceFormatted}</Text>
                  </View>
                </View>
              </View>

              {/* Lot Volume & Pricing Grid */}
              <View style={styles.pricingBox}>
                <View style={styles.priceCol}>
                  <Text style={styles.priceColLabel}>Asking Price</Text>
                  <Text style={styles.priceColVal}>
                    LKR {crop.pricePerKg} <Text style={{ fontSize: 10 }}>/kg</Text>
                  </Text>
                </View>

                <View style={styles.priceDivider} />

                <View style={styles.priceCol}>
                  <Text style={styles.priceColLabel}>Lot Harvest Available</Text>
                  <Text style={styles.priceColVal}>{crop.quantityKg.toLocaleString()} kg</Text>
                </View>

                <View style={styles.priceDivider} />

                <View style={styles.priceCol}>
                  <Text style={styles.priceColLabel}>Total Value</Text>
                  <Text style={styles.totalValueVal}>
                    LKR {(crop.quantityKg * crop.pricePerKg).toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Rule Match Reasons */}
              <View style={styles.reasonsList}>
                {item.matchReasons.map((r, i) => (
                  <View key={i} style={styles.reasonRow}>
                    <Ionicons name="checkmark-circle-outline" size={13} color={Colors.secondary} />
                    <Text style={styles.reasonText}>{r}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.directionsBtn}
                  onPress={() => handleDirections(crop)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate" size={14} color={Colors.text} />
                  <Text style={styles.directionsBtnText}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(crop.farmerPhone)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={14} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.offerBtn}
                  onPress={() => router.push(`/buyer/make-offer/${crop.id}` as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="pricetag" size={14} color="#FFFFFF" />
                  <Text style={styles.offerBtnText}>Make Offer</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Matching Farmgate Crops</Text>
            <Text style={styles.emptySubtitle}>
              Try widening your maximum distance radius or searching for a different crop.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  mapViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  mapViewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  reqStrip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  stripLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  reqChips: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  reqChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reqChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reqChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  reqChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs + 2,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cropImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.border,
  },
  cropDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  tierPill: {
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  tierScore: {
    fontSize: 10,
    fontWeight: '800',
  },
  tierLabel: {
    fontSize: 8,
    fontWeight: '700',
  },
  farmerSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  distanceBadgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  pricingBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  priceCol: {
    flex: 1,
    alignItems: 'center',
  },
  priceDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  priceColLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  priceColVal: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  totalValueVal: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.secondary,
    marginTop: 2,
  },
  reasonsList: {
    gap: 3,
    paddingVertical: 2,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reasonText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  directionsBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.farmerBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  offerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  offerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl * 2,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
