import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBuyer } from '../../context/BuyerContext';
import { Colors } from '../../constants/theme';
import { BuyerCropCard } from '../../components/buyer/BuyerCropCard';
import { CROP_CATEGORIES } from '../../constants/crops';
import { SRI_LANKAN_DISTRICTS } from '../../constants/districts';
import { CropCategory } from '../../types/farmer';
import { CropSortOption } from '../../types/buyer';

export default function BrowseCropsScreen() {
  const { crops, refreshData } = useBuyer();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CropCategory | 'All'>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<CropSortOption>('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Filter & Sort logic
  const filteredCrops = crops
    .filter(crop => {
      // Search
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        crop.cropName.toLowerCase().includes(q) ||
        crop.category.toLowerCase().includes(q) ||
        crop.district.toLowerCase().includes(q) ||
        crop.farmerName.toLowerCase().includes(q);

      // Category
      const matchesCat = selectedCategory === 'All' || crop.category === selectedCategory;

      // District
      const matchesDistrict = selectedDistrict === 'All' || crop.district.toLowerCase() === selectedDistrict.toLowerCase();

      // Price cap
      const matchesPrice = !maxPrice || crop.pricePerKg <= Number(maxPrice);

      return matchesSearch && matchesCat && matchesDistrict && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerKg - b.pricePerKg;
      if (sortBy === 'price_desc') return b.pricePerKg - a.pricePerKg;
      if (sortBy === 'quantity_desc') return b.quantityKg - a.quantityKg;
      // Default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const activeFiltersCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedDistrict !== 'All' ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Browse Crop Listings</Text>
          <Text style={styles.subtitle}>
            Direct farm gate harvests listed across Sri Lanka
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.filterToggleBtn, activeFiltersCount > 0 && styles.filterToggleBtnActive]}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="funnel"
            size={16}
            color={activeFiltersCount > 0 ? Colors.white : Colors.primary}
          />
          <Text
            style={[
              styles.filterToggleBtnText,
              activeFiltersCount > 0 && styles.filterToggleBtnTextActive,
            ]}
          >
            Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search & Sort Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop, farmer name, district..."
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

        {/* Category Horizontal Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {(['All', ...CROP_CATEGORIES] as (CropCategory | 'All')[]).map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sort Pills Row */}
      <View style={styles.sortRow}>
        <Text style={styles.resultsCountText}>
          {filteredCrops.length} {filteredCrops.length === 1 ? 'batch' : 'batches'} found
        </Text>

        <View style={styles.sortChips}>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'newest' && styles.sortChipActive]}
            onPress={() => setSortBy('newest')}
          >
            <Text style={[styles.sortChipText, sortBy === 'newest' && styles.sortChipTextActive]}>
              Newest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_asc' && styles.sortChipActive]}
            onPress={() => setSortBy('price_asc')}
          >
            <Text style={[styles.sortChipText, sortBy === 'price_asc' && styles.sortChipTextActive]}>
              Lowest Price
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_desc' && styles.sortChipActive]}
            onPress={() => setSortBy('price_desc')}
          >
            <Text style={[styles.sortChipText, sortBy === 'price_desc' && styles.sortChipTextActive]}>
              Highest Price
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Crop List */}
      <ScrollView
        contentContainerStyle={styles.scrollList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredCrops.length > 0 ? (
          filteredCrops.map(crop => <BuyerCropCard key={crop.id} crop={crop} />)
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No matching crop listings</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria, price range or district filter.
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersBtn}
              onPress={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedDistrict('All');
                setMaxPrice('');
                setSortBy('newest');
              }}
            >
              <Text style={styles.clearFiltersBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Advanced Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Crop Listings</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Max Price Filter */}
            <Text style={styles.filterSectionTitle}>Maximum Farmgate Price (LKR/kg)</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="e.g. 300 (leave blank for any price)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
            />

            {/* District Filter */}
            <Text style={[styles.filterSectionTitle, { marginTop: 16 }]}>Operating District</Text>
            <View style={styles.districtsGrid}>
              {['All', ...SRI_LANKAN_DISTRICTS.map(d => d.name)].slice(0, 16).map(districtName => {
                const isSelected = selectedDistrict.toLowerCase() === districtName.toLowerCase();
                return (
                  <TouchableOpacity
                    key={districtName}
                    style={[styles.districtChip, isSelected && styles.districtChipActive]}
                    onPress={() => setSelectedDistrict(districtName)}
                  >
                    <Text
                      style={[
                        styles.districtChipText,
                        isSelected && styles.districtChipTextActive,
                      ]}
                    >
                      {districtName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sort Options */}
            <Text style={[styles.filterSectionTitle, { marginTop: 16 }]}>Sort Order</Text>
            <View style={styles.sortModalGrid}>
              {[
                { label: 'Newest Listed', val: 'newest' },
                { label: 'Lowest Price (LKR/kg)', val: 'price_asc' },
                { label: 'Highest Price (LKR/kg)', val: 'price_desc' },
                { label: 'Highest Quantity (kg)', val: 'quantity_desc' },
              ].map(s => (
                <TouchableOpacity
                  key={s.val}
                  style={[styles.sortModalItem, sortBy === s.val && styles.sortModalItemActive]}
                  onPress={() => setSortBy(s.val as CropSortOption)}
                >
                  <Text
                    style={[
                      styles.sortModalItemText,
                      sortBy === s.val && styles.sortModalItemTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                  {sortBy === s.val && (
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSelectedDistrict('All');
                setSelectedCategory('All');
                setMaxPrice('');
                setSortBy('newest');
              }}
            >
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F5F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4E8DC',
  },
  filterToggleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  filterToggleBtnTextActive: {
    color: Colors.white,
  },
  searchSection: {
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
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryPill: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.orangeDark,
    borderColor: Colors.orangeDark,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: Colors.white,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  sortChips: {
    flexDirection: 'row',
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: '#EAF6F0',
    borderColor: Colors.secondary,
  },
  sortChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortChipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  scrollList: {
    padding: 20,
    paddingBottom: 36,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 6,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F5F2',
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
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 17,
  },
  clearFiltersBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  clearFiltersBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  modalBody: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: Colors.textDark,
  },
  districtsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  districtChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  districtChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  districtChipTextActive: {
    color: Colors.white,
  },
  sortModalGrid: {
    gap: 8,
  },
  sortModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortModalItemActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EAF6F0',
  },
  sortModalItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  sortModalItemTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resetBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  applyBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
