import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../context/AdminContext';
import { AdminFarmerUser, AdminBuyerUser } from '../../types/admin';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function AdminUsersScreen() {
  const router = useRouter();
  const {
    farmers,
    buyers,
    updateFarmerStatus,
    updateBuyerVerification,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'farmers' | 'buyers'>('farmers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filtered Farmers
  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.phone.includes(searchQuery) ||
        f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [farmers, searchQuery, statusFilter]);

  // Filtered Buyers
  const filteredBuyers = useMemo(() => {
    return buyers.filter((b) => {
      const matchesSearch =
        b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone.includes(searchQuery) ||
        b.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || b.verificationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [buyers, searchQuery, statusFilter]);

  const handleToggleFarmerStatus = (farmer: AdminFarmerUser) => {
    const newStatus = farmer.status === 'Active' ? 'Suspended' : 'Active';
    Alert.alert(
      `${newStatus === 'Suspended' ? 'Suspend' : 'Activate'} Farmer`,
      `Are you sure you want to mark "${farmer.name}" as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'Suspended' ? 'Suspend Account' : 'Activate Account',
          style: newStatus === 'Suspended' ? 'destructive' : 'default',
          onPress: async () => {
            await updateFarmerStatus(farmer.id, newStatus);
          },
        },
      ]
    );
  };

  const handleToggleBuyerStatus = (buyer: AdminBuyerUser) => {
    if (buyer.verificationStatus === 'Suspended') {
      Alert.alert('Reactivate Buyer', `Restore verified status for "${buyer.businessName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore Access',
          onPress: async () => {
            await updateBuyerVerification(buyer.id, 'Verified');
          },
        },
      ]);
    } else {
      Alert.alert(
        'Suspend Buyer',
        `Suspend commercial purchasing account for "${buyer.businessName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Suspend',
            style: 'destructive',
            onPress: async () => {
              await updateBuyerVerification(buyer.id, 'Suspended');
            },
          },
        ]
      );
    }
  };

  const renderFarmerItem = ({ item }: { item: AdminFarmerUser }) => {
    const isActive = item.status === 'Active';
    return (
      <View style={[styles.userCard, Shadows.card]}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isActive ? '#EAF6F0' : '#FEE2E2' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: isActive ? Colors.secondary : '#DC2626' },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.locationText}>
              {item.village}, {item.district} District
            </Text>
            <Text style={styles.contactText}>
              {item.phone} • {item.email}
            </Text>
          </View>
        </View>

        {/* Farmer Stats Pill */}
        <View style={styles.statsPillRow}>
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>Active Lots</Text>
            <Text style={styles.pillVal}>{item.listingsCount}</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>Sold Harvest</Text>
            <Text style={styles.pillVal}>{item.totalSoldKg.toLocaleString()} kg</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>Rating</Text>
            <Text style={styles.pillVal}>★ {item.rating}</Text>
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.statusToggleBtn,
              { borderColor: isActive ? '#FECACA' : '#C2E5D4' },
            ]}
            onPress={() => handleToggleFarmerStatus(item)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isActive ? 'ban-outline' : 'checkmark-circle-outline'}
              size={15}
              color={isActive ? '#DC2626' : Colors.secondary}
            />
            <Text
              style={[
                styles.statusToggleText,
                { color: isActive ? '#DC2626' : Colors.secondary },
              ]}
            >
              {isActive ? 'Suspend' : 'Activate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => router.push(`/admin/farmer/${item.id}` as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsBtnText}>View & Edit</Text>
            <Ionicons name="chevron-forward" size={14} color="#D97706" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBuyerItem = ({ item }: { item: AdminBuyerUser }) => {
    const isVerified = item.verificationStatus === 'Verified';
    const isPending = item.verificationStatus === 'Pending';
    const isSuspended = item.verificationStatus === 'Suspended';

    const getStatusStyle = () => {
      if (isVerified) return { bg: '#EAF6F0', color: Colors.secondary };
      if (isPending) return { bg: '#FEF3C7', color: '#D97706' };
      if (isSuspended) return { bg: '#FEE2E2', color: '#DC2626' };
      return { bg: '#F1F5F9', color: '#64748B' };
    };

    const statusStyle = getStatusStyle();

    return (
      <View style={[styles.userCard, Shadows.card]}>
        <View style={styles.cardHeader}>
          <View style={styles.buyerIconBox}>
            <Ionicons name="business" size={24} color={Colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.businessName}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>
                  {item.verificationStatus}
                </Text>
              </View>
            </View>

            <Text style={styles.locationText}>
              Proprietor: {item.ownerName} • {item.businessType}
            </Text>
            <Text style={styles.contactText}>
              {item.phone} • {item.district}
            </Text>
          </View>
        </View>

        {/* BRN Registration Note */}
        <View style={styles.brnBox}>
          <Ionicons name="ribbon-outline" size={14} color="#D97706" />
          <Text style={styles.brnText}>
            BRN: <Text style={{ fontWeight: '700' }}>{item.brnNumber}</Text>
          </Text>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          {isPending ? (
            <TouchableOpacity
              style={styles.verifyActionBtn}
              onPress={() => router.push('/admin/verifications' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={15} color="#FFFFFF" />
              <Text style={styles.verifyActionText}>Review Verification</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.statusToggleBtn,
                { borderColor: isSuspended ? '#C2E5D4' : '#FECACA' },
              ]}
              onPress={() => handleToggleBuyerStatus(item)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSuspended ? 'checkmark-circle-outline' : 'ban-outline'}
                size={15}
                color={isSuspended ? Colors.secondary : '#DC2626'}
              />
              <Text
                style={[
                  styles.statusToggleText,
                  { color: isSuspended ? Colors.secondary : '#DC2626' },
                ]}
              >
                {isSuspended ? 'Reactivate' : 'Suspend'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => router.push(`/admin/buyer/${item.id}` as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsBtnText}>View & Edit</Text>
            <Ionicons name="chevron-forward" size={14} color="#D97706" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Accounts Management</Text>
        <Text style={styles.headerSubtitle}>
          Govern registered farmers & commercial purchasing entities
        </Text>

        {/* Segment Tabs */}
        <View style={styles.segmentBar}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'farmers' && styles.segmentBtnActive]}
            onPress={() => {
              setActiveTab('farmers');
              setStatusFilter('All');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="leaf"
              size={15}
              color={activeTab === 'farmers' ? '#FFFFFF' : '#94A3B8'}
            />
            <Text style={[styles.segmentText, activeTab === 'farmers' && styles.segmentTextActive]}>
              Farmers ({farmers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'buyers' && styles.segmentBtnActive]}
            onPress={() => {
              setActiveTab('buyers');
              setStatusFilter('All');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business"
              size={15}
              color={activeTab === 'buyers' ? '#FFFFFF' : '#94A3B8'}
            />
            <Text style={[styles.segmentText, activeTab === 'buyers' && styles.segmentTextActive]}>
              Buyers ({buyers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'farmers'
                ? 'Search by farmer name, district, or phone...'
                : 'Search by business name, owner, or BRN...'
            }
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

      {/* Filter Chips Bar */}
      <View style={styles.filterBar}>
        {(activeTab === 'farmers'
          ? ['All', 'Active', 'Suspended']
          : ['All', 'Verified', 'Pending', 'Suspended', 'Rejected']
        ).map((status) => {
          const isSel = statusFilter === status;
          return (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, isSel && styles.filterChipActive]}
              onPress={() => setStatusFilter(status)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User Directory List */}
      <FlatList
        data={activeTab === 'farmers' ? (filteredFarmers as any) : (filteredBuyers as any)}
        keyExtractor={(item) => item.id}
        renderItem={activeTab === 'farmers' ? (renderFarmerItem as any) : (renderBuyerItem as any)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No matching users found</Text>
            <Text style={styles.emptySubtitle}>
              Try clearing your search query or adjusting the status filter.
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: '#94A3B8',
  },
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.md,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#D97706',
  },
  segmentText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: '#94A3B8',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  userCard: {
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.border,
  },
  buyerIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAF6F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statsPillRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs + 2,
    alignItems: 'center',
  },
  pillItem: {
    flex: 1,
    alignItems: 'center',
  },
  pillLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  pillVal: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  pillDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  brnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    gap: 6,
  },
  brnText: {
    fontSize: 11,
    color: '#92400E',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    gap: 4,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  verifyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    gap: 4,
  },
  verifyActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 2,
  },
  detailsBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#D97706',
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl * 1.5,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
