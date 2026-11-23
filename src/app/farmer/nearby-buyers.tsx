import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFarmer } from '../../context/FarmerContext';
import { useLocation } from '../../context/LocationContext';
import { locationService } from '../../services/locationService';
import { MatchTier } from '../../types/location';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function NearbyBuyersMatchingScreen() {
  const router = useRouter();
  const { crops, buyers } = useFarmer();
  const { userLocation } = useLocation();

  const [selectedCropId, setSelectedCropId] = useState<string>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(100);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'score' | 'distance' | 'verified'>('score');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected crop reference
  const activeCrop = crops.find((c) => c.id === selectedCropId);

  // Compute rule-based matching results
  const matchedResults = useMemo(() => {
    const listingForMatching = activeCrop
      ? {
          cropName: activeCrop.cropName,
          category: activeCrop.category,
          quantityKg: activeCrop.quantityKg,
          pricePerKg: activeCrop.pricePerKg,
          district: activeCrop.district,
          coords: locationService.getDistrictCoordinates(activeCrop.district),
        }
      : {
          cropName: '',
          quantityKg: 2000,
          pricePerKg: 250,
          district: userLocation.district || 'Dambulla',
          coords: userLocation.coords,
        };

    const rawMatches = locationService.matchBuyersForFarmer(
      listingForMatching,
      buyers.map((b) => ({
        ...b,
        verificationStatus: b.verified ? 'Verified' : 'Pending',
        coords: locationService.getDistrictCoordinates(b.district),
      }))
    );

    return rawMatches.filter((match) => {
      const b = match.item;
      const matchesSearch =
        b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.requiredCrop && b.requiredCrop.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDistance = match.distanceKm === null || match.distanceKm <= maxDistanceKm;
      const matchesVerified = !onlyVerified || b.verified;

      return matchesSearch && matchesDistance && matchesVerified;
    });
  }, [activeCrop, buyers, userLocation, searchQuery, maxDistanceKm, onlyVerified]);

  const sortedResults = useMemo(() => {
    return [...matchedResults].sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm || 9999) - (b.distanceKm || 9999);
      }
      if (sortBy === 'verified') {
        return (b.item.verified ? 1 : 0) - (a.item.verified ? 1 : 0);
      }
      return b.matchScore - a.matchScore;
    });
  }, [matchedResults, sortBy]);

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

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleDirections = (buyer: any) => {
    const coords = locationService.getDistrictCoordinates(buyer.district);
    locationService.openExternalMaps(coords, buyer.businessName);
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
            <Text style={styles.headerTitle}>Nearby Buyer Matcher</Text>
            <Text style={styles.headerSubtitle}>
              Rule-based proximity & demand matching for your harvest
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
            placeholder="Search by buyer name, crop demand, or district..."
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

      {/* Crop Selector Horizontal Strip */}
      <View style={styles.cropSelectorBar}>
        <Text style={styles.selectorLabel}>MATCH AGAINST CROP:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cropChips}>
          <TouchableOpacity
            style={[styles.cropChip, selectedCropId === 'all' && styles.cropChipActive]}
            onPress={() => setSelectedCropId('all')}
          >
            <Text style={[styles.cropChipText, selectedCropId === 'all' && styles.cropChipTextActive]}>
              All My Crops ({crops.length})
            </Text>
          </TouchableOpacity>

          {crops.map((c) => {
            const isSel = selectedCropId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.cropChip, isSel && styles.cropChipActive]}
                onPress={() => setSelectedCropId(c.id)}
              >
                <Text style={[styles.cropChipText, isSel && styles.cropChipTextActive]}>
                  {c.cropName} ({c.quantityKg} kg)
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter & Sort Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {/* Max Distance Filter Chips */}
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

          {/* Verified Toggle */}
          <TouchableOpacity
            style={[styles.filterChip, onlyVerified && styles.filterChipActive]}
            onPress={() => setOnlyVerified(!onlyVerified)}
          >
            <Ionicons
              name={onlyVerified ? 'checkmark-circle' : 'shield-outline'}
              size={12}
              color={onlyVerified ? '#FFFFFF' : Colors.textSecondary}
            />
            <Text style={[styles.filterChipText, onlyVerified && styles.filterChipTextActive]}>
              Verified Only
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Rule-Based Transparency Banner */}
      <View style={styles.transparencyNotice}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
        <Text style={styles.transparencyText}>
          <Text style={{ fontWeight: '700' }}>Smart Rule-Based Matching:</Text> Relevance scores are computed from geographic distance, crop requirements, volume, and pricing compatibility.
        </Text>
      </View>

      {/* Matched Buyers List */}
      <FlatList
        data={sortedResults}
        keyExtractor={(item) => item.item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const buyer = item.item;
          const tier = getTierBadge(item.matchTier);

          return (
            <View style={[styles.buyerCard, Shadows.card]}>
              {/* Header with Title and Match Score Pill */}
              <View style={styles.cardHeader}>
                <View style={styles.buyerIdentity}>
                  <Text style={styles.businessName} numberOfLines={1}>
                    {buyer.businessName}
                  </Text>
                  <Text style={styles.buyerType}>
                    Proprietor: {buyer.ownerName} • {buyer.businessType}
                  </Text>
                </View>

                <View style={[styles.tierBadge, { backgroundColor: tier.bg, borderColor: tier.border }]}>
                  <Text style={[styles.scoreNum, { color: tier.text }]}>{item.matchScore}%</Text>
                  <Text style={[styles.tierText, { color: tier.text }]}>{item.matchTier}</Text>
                </View>
              </View>

              {/* Proximity & Distance Bar */}
              <View style={styles.distanceBar}>
                <Ionicons name="navigate-outline" size={14} color={Colors.primary} />
                <Text style={styles.distanceText}>
                  <Text style={{ fontWeight: '700' }}>{item.distanceFormatted}</Text> ({buyer.district} District)
                </Text>
                {buyer.verified && (
                  <View style={styles.verifiedTag}>
                    <Ionicons name="checkmark-circle" size={12} color={Colors.secondary} />
                    <Text style={styles.verifiedTagText}>Verified</Text>
                  </View>
                )}
              </View>

              {/* Demand Specification Box */}
              <View style={styles.demandBox}>
                <View style={styles.demandCol}>
                  <Text style={styles.demandLabel}>Required Crop</Text>
                  <Text style={styles.demandVal}>{buyer.requiredCrop || 'Bulk Vegetables'}</Text>
                </View>
                <View style={styles.demandDivider} />
                <View style={styles.demandCol}>
                  <Text style={styles.demandLabel}>Volume Wanted</Text>
                  <Text style={styles.demandVal}>
                    {buyer.requiredQuantityKg ? `${buyer.requiredQuantityKg.toLocaleString()} kg` : 'Flexible Batch'}
                  </Text>
                </View>
                <View style={styles.demandDivider} />
                <View style={styles.demandCol}>
                  <Text style={styles.demandLabel}>Budget Ceiling</Text>
                  <Text style={styles.demandPrice}>
                    {buyer.maxPricePerKg ? `LKR ${buyer.maxPricePerKg}/kg` : 'Market Fair'}
                  </Text>
                </View>
              </View>

              {/* Match Explanation Reasons */}
              <View style={styles.reasonsList}>
                {item.matchReasons.map((reason, idx) => (
                  <View key={idx} style={styles.reasonRow}>
                    <Ionicons name="checkmark-circle-outline" size={12} color={Colors.secondary} />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.directionsActionBtn}
                  onPress={() => handleDirections(buyer)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate" size={14} color={Colors.text} />
                  <Text style={styles.directionsActionText}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callActionBtn}
                  onPress={() => handleCall(buyer.phone)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={14} color="#FFFFFF" />
                  <Text style={styles.callActionText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewProfileBtn}
                  onPress={() => router.push(`/farmer/buyer/${buyer.id}` as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewProfileBtnText}>View Buyer Profile</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Matching Buyers Nearby</Text>
            <Text style={styles.emptySubtitle}>
              Try increasing your maximum distance radius or selecting "All My Crops".
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
  cropSelectorBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  cropChips: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  cropChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cropChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cropChipTextActive: {
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
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
  transparencyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6F0',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#C2E5D4',
  },
  transparencyText: {
    flex: 1,
    fontSize: 11,
    color: Colors.primary,
    lineHeight: 15,
  },
  listContent: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  buyerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  buyerIdentity: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  businessName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  buyerType: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tierBadge: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  scoreNum: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  tierText: {
    fontSize: 9,
    fontWeight: '700',
  },
  distanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    gap: 6,
  },
  distanceText: {
    fontSize: 11,
    color: Colors.text,
    flex: 1,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  demandBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  demandCol: {
    flex: 1,
    alignItems: 'center',
  },
  demandDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  demandLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  demandVal: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
    textAlign: 'center',
  },
  demandPrice: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.primary,
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
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
  },
  directionsActionBtn: {
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
  directionsActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  callActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    gap: 4,
  },
  callActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
    gap: 4,
  },
  viewProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
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
