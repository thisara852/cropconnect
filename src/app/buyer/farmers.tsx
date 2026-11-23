import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBuyer } from '../../context/BuyerContext';
import { FarmerCard } from '../../components/buyer/FarmerCard';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

const DISTRICT_CHIPS = [
  'All Districts',
  'Dambulla',
  'Anuradhapura',
  'Nuwara Eliya',
  'Kandy',
  'Kurunegala',
  'Badulla',
  'Ratnapura',
  'Jaffna',
];

export default function FindFarmersScreen() {
  const router = useRouter();
  const { farmers } = useBuyer();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');

  const filteredFarmers = useMemo(() => {
    return farmers.filter((farmer) => {
      const matchesSearch =
        farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.cropsOffered.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        farmer.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.village.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDistrict =
        selectedDistrict === 'All Districts' ||
        farmer.district.toLowerCase() === selectedDistrict.toLowerCase();

      return matchesSearch && matchesDistrict;
    });
  }, [farmers, searchQuery, selectedDistrict]);

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
            <Text style={styles.headerTitle}>Find Local Farmers</Text>
            <Text style={styles.headerSubtitle}>Direct sourcing partnerships with Sri Lankan producers</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by farmer name, crop, or location..."
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

      {/* District Filter Chips */}
      <View style={styles.districtBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.districtChips}
        >
          {DISTRICT_CHIPS.map((dist) => {
            const isSelected = selectedDistrict === dist;
            return (
              <TouchableOpacity
                key={dist}
                style={[styles.districtChip, isSelected && styles.districtChipActive]}
                onPress={() => setSelectedDistrict(dist)}
                activeOpacity={0.8}
              >
                <Text style={[styles.districtChipText, isSelected && styles.districtChipTextActive]}>
                  {dist}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results List */}
      <FlatList
        data={filteredFarmers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FarmerCard farmer={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.resultsInfoRow}>
            <Text style={styles.resultsCount}>
              Showing <Text style={{ fontWeight: '700', color: Colors.primary }}>{filteredFarmers.length}</Text> verified farmers
            </Text>
            {selectedDistrict !== 'All Districts' && (
              <TouchableOpacity onPress={() => setSelectedDistrict('All Districts')}>
                <Text style={styles.clearFilterText}>Reset District</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Farmers Found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for a different crop name or reset the district filter.
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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  districtBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs + 2,
  },
  districtChips: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  districtChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  districtChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  districtChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  resultsCount: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  clearFilterText: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl * 1.5,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
