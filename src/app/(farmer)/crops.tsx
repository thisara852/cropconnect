import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFarmer } from '../../context/FarmerContext';
import { Colors } from '../../constants/theme';
import { CropCard } from '../../components/farmer/CropCard';
import { CropStatus } from '../../types/farmer';

const STATUS_FILTERS: (CropStatus | 'All')[] = [
  'All',
  'Active',
  'Rescue Alert',
  'Under Offer',
  'Sold',
];

export default function MyCropsScreen() {
  const router = useRouter();
  const { crops, deleteCrop, refreshData } = useFarmer();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CropStatus | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredCrops = crops.filter(c => {
    const matchesSearch =
      c.cropName.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' ? true : c.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Crop Listings</Text>
          <Text style={styles.subtitle}>
            {crops.length} {crops.length === 1 ? 'batch' : 'batches'} listed on island-wide marketplace
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/farmer/crop-add' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={Colors.white} />
          <Text style={styles.addBtnText}>Add Crop</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop name, category, district..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Horizontal Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusChipsRow}
        >
          {STATUS_FILTERS.map(status => {
            const isSelected = selectedStatus === status;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusChip,
                  isSelected && styles.statusChipSelected,
                  status === 'Rescue Alert' && styles.statusChipRescue,
                  isSelected && status === 'Rescue Alert' && styles.statusChipRescueSelected,
                ]}
                onPress={() => setSelectedStatus(status)}
                activeOpacity={0.7}
              >
                {status === 'Rescue Alert' && (
                  <Ionicons
                    name="flash"
                    size={11}
                    color={isSelected ? Colors.white : Colors.error}
                    style={{ marginRight: 3 }}
                  />
                )}
                <Text
                  style={[
                    styles.statusChipText,
                    isSelected && styles.statusChipTextSelected,
                    status === 'Rescue Alert' && !isSelected && { color: Colors.error },
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Crop List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredCrops.length > 0 ? (
          filteredCrops.map(crop => (
            <CropCard key={crop.id} crop={crop} onDelete={deleteCrop} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="leaf-outline" size={36} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No matching listings</Text>
            <Text style={styles.emptySubtitle}>
              {search || selectedStatus !== 'All'
                ? 'Try clearing your filters or search keywords.'
                : 'You have not added any harvest batches yet.'}
            </Text>

            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => router.push('/farmer/crop-add' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color={Colors.white} />
              <Text style={styles.emptyAddBtnText}>Add New Crop Listing</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  filterSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textDark,
  },
  statusChipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusChipRescue: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  statusChipRescueSelected: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusChipTextSelected: {
    color: Colors.white,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 36,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 6,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    marginBottom: 14,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
