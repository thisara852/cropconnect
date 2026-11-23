import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBuyer } from '../../context/BuyerContext';
import { Colors, Shadows } from '../../constants/theme';
import { OfferStatus } from '../../types/buyer';

const STATUS_FILTERS: (OfferStatus | 'All')[] = [
  'All',
  'Pending',
  'Accepted',
  'Rejected',
  'Cancelled',
];

export default function MyOffersScreen() {
  const router = useRouter();
  const { offers, cancelOffer, refreshData } = useBuyer();

  const [selectedStatus, setSelectedStatus] = useState<OfferStatus | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredOffers = offers.filter(o => {
    if (selectedStatus === 'All') return true;
    return o.status === selectedStatus;
  });

  const handleCancel = (offerId: string, cropName: string) => {
    Alert.alert(
      'Cancel Offer',
      `Are you sure you want to withdraw your offer for ${cropName}?`,
      [
        { text: 'No, Keep Offer', style: 'cancel' },
        {
          text: 'Yes, Cancel Offer',
          style: 'destructive',
          onPress: async () => {
            const ok = await cancelOffer(offerId);
            if (ok) {
              Alert.alert('Offer Cancelled', 'Your bid has been withdrawn.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return { bg: Colors.successBg, text: Colors.success, border: '#C2EED3', icon: 'checkmark-circle' };
      case 'Rejected':
        return { bg: Colors.errorBg, text: Colors.error, border: '#FCA5A5', icon: 'close-circle' };
      case 'Cancelled':
        return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1', icon: 'ban' };
      default:
        return { bg: Colors.buyerBg, text: Colors.orangeDark, border: '#FCD7A8', icon: 'time' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Commercial Offers</Text>
          <Text style={styles.subtitle}>
            Track and manage your wholesale bids submitted to Sri Lankan growers
          </Text>
        </View>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map(st => {
            const isSelected = selectedStatus === st;
            return (
              <TouchableOpacity
                key={st}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedStatus(st)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Offers List */}
      <ScrollView
        contentContainerStyle={styles.scrollList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredOffers.length > 0 ? (
          filteredOffers.map(offer => {
            const statusStyle = getStatusColor(offer.status);
            const isPending = offer.status === 'Pending';
            const isAccepted = offer.status === 'Accepted';

            return (
              <View key={offer.id} style={[styles.card, Shadows.card]}>
                {/* Top Row: Crop Name & Status Badge */}
                <View style={styles.topRow}>
                  <View style={styles.cropTitleBox}>
                    <Text style={styles.cropName}>{offer.cropName}</Text>
                    <Text style={styles.offerDate}>
                      Submitted {new Date(offer.offerDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
                    ]}
                  >
                    <Ionicons name={statusStyle.icon as any} size={11} color={statusStyle.text} />
                    <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                      {offer.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Pricing & Volume Breakdown */}
                <View style={styles.metricsBox}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Bid Rate</Text>
                    <Text style={styles.metricRate}>
                      LKR {offer.offeredPricePerKg}
                      <Text style={styles.metricUnit}>/kg</Text>
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Volume</Text>
                    <Text style={styles.metricVol}>
                      {offer.requestedQuantityKg.toLocaleString()}
                      <Text style={styles.metricUnit}> kg</Text>
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Total Payout</Text>
                    <Text style={styles.metricPayout}>
                      LKR {offer.totalValueLkr.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Farmer / Delivery Location */}
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.locationText}>
                    Destination Hub: <Text style={styles.locationBold}>{offer.buyerLocation}</Text>
                  </Text>
                </View>

                {/* Notes if provided */}
                {offer.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>"{offer.notes}"</Text>
                  </View>
                ) : null}

                {/* Tracking Progress Ribbon */}
                <View style={styles.statusTrackRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isAccepted ? Colors.success : isPending ? Colors.orangeDark : '#94A3B8' },
                    ]}
                  />
                  <Text style={styles.statusTrackText}>
                    {isAccepted
                      ? 'Offer Accepted by Farmer! Co-ordinating harvest dispatch.'
                      : isPending
                      ? 'Awaiting farmer response. Listing remains open.'
                      : offer.status === 'Rejected'
                      ? 'Farmer declined bid. Consider adjusting price per kg.'
                      : 'You withdrew this offer.'}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.viewCropBtn}
                    onPress={() => router.push(`/buyer/crop/${offer.cropListingId}` as any)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="eye-outline" size={14} color={Colors.primary} />
                    <Text style={styles.viewCropBtnText}>View Crop Lot</Text>
                  </TouchableOpacity>

                  {isPending && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancel(offer.id, offer.cropName)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle-outline" size={14} color={Colors.error} />
                      <Text style={styles.cancelBtnText}>Withdraw Bid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetags-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No offers in this category</Text>
            <Text style={styles.emptySubtitle}>
              Browse farmer crop listings and make competitive bids to secure quality produce.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push('/(buyer)/browse' as any)}
            >
              <Ionicons name="grid" size={15} color={Colors.white} />
              <Text style={styles.browseBtnText}>Browse Available Crops</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.orangeDark,
    borderColor: Colors.orangeDark,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  scrollList: {
    padding: 20,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cropTitleBox: {
    flex: 1,
    marginRight: 8,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  offerDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF6',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEF3EA',
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricRate: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  metricVol: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  metricPayout: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.orangeDark,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  locationBold: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  notesBox: {
    backgroundColor: '#FAF5EE',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 11,
    color: Colors.textDark,
    fontStyle: 'italic',
  },
  statusTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F4EC',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTrackText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewCropBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F5F2',
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewCropBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.errorBg,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
    marginBottom: 10,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.orange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
