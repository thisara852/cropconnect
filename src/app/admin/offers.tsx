import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../context/AdminContext';
import { BuyerOffer } from '../../types/farmer';
import { OfferStatus } from '../../types/buyer';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function AdminOffersScreen() {
  const router = useRouter();
  const { offers } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        offer.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.buyerLocation && offer.buyerLocation.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = selectedStatus === 'All' || offer.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [offers, searchQuery, selectedStatus]);

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case 'Accepted':
        return { bg: '#EAF6F0', color: Colors.secondary, text: 'Accepted' };
      case 'Rejected':
        return { bg: '#FEE2E2', color: '#DC2626', text: 'Rejected' };
      case 'Cancelled':
        return { bg: '#F1F5F9', color: '#64748B', text: 'Cancelled' };
      default:
        return { bg: '#FEF3C7', color: '#D97706', text: 'Pending Farmer Review' };
    }
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
            <Text style={styles.headerTitle}>Bilateral Offers Audit</Text>
            <Text style={styles.headerSubtitle}>
              Fair-price monitoring of farmer-buyer commercial negotiations
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by crop, buyer name, or depot location..."
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

      {/* Market Neutrality Banner */}
      <View style={styles.neutralityBanner}>
        <Ionicons name="shield-checkmark" size={18} color="#D97706" />
        <Text style={styles.neutralityText}>
          <Text style={{ fontWeight: '700' }}>Market Neutrality Guard:</Text> Administrators maintain read-only audit oversight. Offer values cannot be modified by third parties to protect bilateral contract integrity.
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'].map((st) => {
          const isSel = selectedStatus === st;
          return (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, isSel && styles.filterChipActive]}
              onPress={() => setSelectedStatus(st)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Offers FlatList */}
      <FlatList
        data={filteredOffers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          const totalVal = item.offeredPricePerKg * item.requestedQuantityKg;
          return (
            <View style={[styles.offerCard, Shadows.card]}>
              <View style={styles.cardTop}>
                <View style={styles.cropTitleCol}>
                  <Text style={styles.cropName}>{item.cropName}</Text>
                  <Text style={styles.dateText}>Transmitted: {item.offerDate}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.text}</Text>
                </View>
              </View>

              <View style={styles.partiesRow}>
                <View style={styles.partyItem}>
                  <Text style={styles.partyLabel}>Buyer Entity</Text>
                  <Text style={styles.partyName} numberOfLines={1}>{item.buyerName}</Text>
                  <Text style={styles.partySub}>{item.buyerLocation || 'Sri Lanka'}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} style={{ marginTop: 12 }} />
                <View style={styles.partyItem}>
                  <Text style={styles.partyLabel}>Farmer Contact</Text>
                  <Text style={styles.partyName} numberOfLines={1}>{item.buyerPhone || '+94 77 xxx xxxx'}</Text>
                  <Text style={styles.partySub}>Direct Negotiator</Text>
                </View>
              </View>

              <View style={styles.termsBox}>
                <View style={styles.termCol}>
                  <Text style={styles.termLabel}>Offered Price</Text>
                  <Text style={styles.termPrice}>LKR {item.offeredPricePerKg} <Text style={{ fontSize: 10 }}>/kg</Text></Text>
                </View>
                <View style={styles.termDivider} />
                <View style={styles.termCol}>
                  <Text style={styles.termLabel}>Volume</Text>
                  <Text style={styles.termVal}>{item.requestedQuantityKg.toLocaleString()} kg</Text>
                </View>
                <View style={styles.termDivider} />
                <View style={styles.termCol}>
                  <Text style={styles.termLabel}>Total Payout</Text>
                  <Text style={styles.termTotal}>LKR {totalVal.toLocaleString()}</Text>
                </View>
              </View>

              {item.notes ? (
                <Text style={styles.notesText} numberOfLines={2}>
                  Note: "{item.notes}"
                </Text>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetags-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Offers Logged</Text>
            <Text style={styles.emptySubtitle}>
              No bilateral trade offers match your selected filter criteria.
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
    backgroundColor: '#0F172A',
  },
  header: {
    backgroundColor: '#0F172A',
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
    backgroundColor: '#1E293B',
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
    color: '#94A3B8',
    marginTop: 2,
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
  neutralityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  neutralityText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
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
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropTitleCol: {
    flex: 1,
  },
  cropName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  dateText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  partyItem: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  partyName: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  partySub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  termsBox: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  termCol: {
    flex: 1,
    alignItems: 'center',
  },
  termDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  termLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  termPrice: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  termVal: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  termTotal: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.secondary,
    marginTop: 2,
  },
  notesText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
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
    marginTop: 2,
  },
});
