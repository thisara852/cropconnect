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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFarmer } from '../../context/FarmerContext';
import { Colors } from '../../constants/theme';
import { BuyerCard } from '../../components/farmer/BuyerCard';

const DISTRICT_QUICK_FILTERS = [
  'All',
  'Colombo',
  'Matale',
  'Kandy',
  'Anuradhapura',
  'Galle',
  'Kurunegala',
];

export default function NearbyBuyersScreen() {
  const { buyers, refreshData } = useFarmer();
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredBuyers = buyers.filter(b => {
    const matchesSearch =
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.requiredCrop.toLowerCase().includes(search.toLowerCase()) ||
      b.district.toLowerCase().includes(search.toLowerCase()) ||
      b.businessType.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict =
      selectedDistrict === 'All' ? true : b.district === selectedDistrict;

    return matchesSearch && matchesDistrict;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nearby Commercial Buyers</Text>
          <Text style={styles.subtitle}>
            Direct procurement agents & supermarkets ready for sourcing
          </Text>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search buyer name, required crop, district..."
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

        {/* District Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.districtChipsRow}
        >
          {DISTRICT_QUICK_FILTERS.map(district => {
            const isSelected = selectedDistrict === district;
            return (
              <TouchableOpacity
                key={district}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedDistrict(district)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {district}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Buyer Cards List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.resultSummaryRow}>
          <Text style={styles.resultSummaryText}>
            Showing {filteredBuyers.length} verified commercial purchasers
          </Text>
        </View>

        {filteredBuyers.length > 0 ? (
          filteredBuyers.map(buyer => <BuyerCard key={buyer.id} buyer={buyer} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={38} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No buyers found</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting a different district or adjusting search terms.
            </Text>
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
  districtChipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 36,
  },
  resultSummaryRow: {
    marginBottom: 12,
  },
  resultSummaryText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 6,
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
    maxWidth: 240,
  },
});
