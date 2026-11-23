import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../context/AdminContext';
import { MarketPriceRecord } from '../../types/admin';
import { CropCategory } from '../../types/farmer';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

const DISTRICTS = [
  'All Districts',
  'Dambulla',
  'Anuradhapura',
  'Nuwara Eliya',
  'Kandy',
  'Badulla',
  'Jaffna',
  'Matale',
  'Hambantota',
  'Kurunegala',
];

const CATEGORIES: CropCategory[] = [
  'Vegetables',
  'Fruits',
  'Grains & Paddy',
  'Spices',
  'Tubers & Roots',
];

export default function AdminPricesScreen() {
  const router = useRouter();
  const { prices, addPriceRecord, updatePriceRecord, deletePriceRecord } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');

  // Add / Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Vegetables');
  const [district, setDistrict] = useState('Dambulla');
  const [minPrice, setMinPrice] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [isVerifiedGovt, setIsVerifiedGovt] = useState(true);

  const filteredPrices = useMemo(() => {
    return prices.filter((p) => {
      const matchesSearch =
        p.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sourceReference.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict =
        selectedDistrict === 'All Districts' ||
        p.district.toLowerCase() === selectedDistrict.toLowerCase();
      return matchesSearch && matchesDistrict;
    });
  }, [prices, searchQuery, selectedDistrict]);

  const openAddModal = () => {
    setEditingId(null);
    setCropName('');
    setCategory('Vegetables');
    setDistrict('Dambulla');
    setMinPrice('');
    setAvgPrice('');
    setMaxPrice('');
    setSourceReference('Dambulla Dedicated Economic Centre Bulletin');
    setIsVerifiedGovt(true);
    setModalVisible(true);
  };

  const openEditModal = (p: MarketPriceRecord) => {
    setEditingId(p.id);
    setCropName(p.cropName);
    setCategory(p.category);
    setDistrict(p.district);
    setMinPrice(String(p.minPricePerKg));
    setAvgPrice(String(p.avgPricePerKg));
    setMaxPrice(String(p.maxPricePerKg));
    setSourceReference(p.sourceReference);
    setIsVerifiedGovt(p.isVerifiedGovt);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!cropName.trim()) {
      Alert.alert('Validation Error', 'Please enter crop name.');
      return;
    }
    const numMin = parseFloat(minPrice);
    const numAvg = parseFloat(avgPrice);
    const numMax = parseFloat(maxPrice);

    if (isNaN(numMin) || isNaN(numAvg) || isNaN(numMax)) {
      Alert.alert('Validation Error', 'Please enter valid numerical prices.');
      return;
    }

    if (numMin > numAvg || numAvg > numMax) {
      Alert.alert('Validation Error', 'Prices must follow rule: Min <= Average <= Max.');
      return;
    }

    const payload = {
      cropName: cropName.trim(),
      category,
      district,
      minPricePerKg: numMin,
      avgPricePerKg: numAvg,
      maxPricePerKg: numMax,
      recordedDate: new Date().toISOString().split('T')[0],
      sourceReference: sourceReference.trim() || 'Ministry Market Surveillance Committee',
      isVerifiedGovt,
    };

    if (editingId) {
      await updatePriceRecord(editingId, payload);
    } else {
      await addPriceRecord(payload);
    }

    setModalVisible(false);
    Alert.alert('Success', `Price benchmark record for "${cropName}" saved.`);
  };

  const handleDelete = (p: MarketPriceRecord) => {
    Alert.alert('Delete Benchmark', `Remove price benchmark record for "${p.cropName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePriceRecord(p.id);
        },
      },
    ]);
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
            <Text style={styles.headerTitle}>Crop Price Benchmarks</Text>
            <Text style={styles.headerSubtitle}>
              Manage regional reference price indexes for AI matching & arbitration
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.85}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Price</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search price records by crop name or source..."
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.districtChips}>
          {DISTRICTS.map((d) => {
            const isSel = selectedDistrict === d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.districtChip, isSel && styles.districtChipActive]}
                onPress={() => setSelectedDistrict(d)}
                activeOpacity={0.8}
              >
                <Text style={[styles.districtChipText, isSel && styles.districtChipTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Prices List */}
      <FlatList
        data={filteredPrices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.priceCard, Shadows.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cropTitleCol}>
                <Text style={styles.cropTitle}>{item.cropName}</Text>
                <Text style={styles.districtSub}>
                  {item.district} District • {item.category}
                </Text>
              </View>

              <View
                style={[
                  styles.verifiedBadge,
                  { backgroundColor: item.isVerifiedGovt ? '#EAF6F0' : '#FEF3C7' },
                ]}
              >
                <Ionicons
                  name={item.isVerifiedGovt ? 'checkmark-circle' : 'time-outline'}
                  size={12}
                  color={item.isVerifiedGovt ? Colors.secondary : '#D97706'}
                />
                <Text
                  style={[
                    styles.verifiedText,
                    { color: item.isVerifiedGovt ? Colors.secondary : '#D97706' },
                  ]}
                >
                  {item.isVerifiedGovt ? 'Official Gov Index' : 'Sample Benchmark'}
                </Text>
              </View>
            </View>

            {/* Price Triplet Display */}
            <View style={styles.priceTriplet}>
              <View style={styles.priceCol}>
                <Text style={styles.priceLabel}>Floor (Min)</Text>
                <Text style={styles.priceMin}>LKR {item.minPricePerKg}</Text>
              </View>

              <View style={styles.priceColMid}>
                <Text style={styles.priceLabelMid}>Fair Average</Text>
                <Text style={styles.priceAvg}>LKR {item.avgPricePerKg}</Text>
                <Text style={styles.perKgText}>/kg</Text>
              </View>

              <View style={styles.priceCol}>
                <Text style={styles.priceLabel}>Ceiling (Max)</Text>
                <Text style={styles.priceMax}>LKR {item.maxPricePerKg}</Text>
              </View>
            </View>

            {/* Source Reference & Actions */}
            <View style={styles.footerRow}>
              <View style={styles.sourceCol}>
                <Text style={styles.sourceLabel}>SOURCE / REC. DATE:</Text>
                <Text style={styles.sourceVal} numberOfLines={1}>
                  {item.sourceReference} ({item.recordedDate})
                </Text>
              </View>

              <View style={styles.actionsRight}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                  <Ionicons name="pencil-outline" size={16} color="#0F172A" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtnDelete}>
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trending-down-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Price Records Found</Text>
            <Text style={styles.emptySubtitle}>Tap "Add Price" to introduce a regional benchmark record.</Text>
          </View>
        }
      />

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.floating]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Price Benchmark' : 'New Crop Price Benchmark'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Crop Name & Variety</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Big Onions (Dambulla Red)"
                  value={cropName}
                  onChangeText={setCropName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>District</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Dambulla, Nuwara Eliya"
                  value={district}
                  onChangeText={setDistrict}
                />
              </View>

              <View style={styles.tripletInputs}>
                <View style={styles.smallInputGroup}>
                  <Text style={styles.inputLabel}>Min (LKR)</Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="240"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                </View>

                <View style={styles.smallInputGroup}>
                  <Text style={styles.inputLabel}>Avg (LKR)</Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="275"
                    keyboardType="numeric"
                    value={avgPrice}
                    onChangeText={setAvgPrice}
                  />
                </View>

                <View style={styles.smallInputGroup}>
                  <Text style={styles.inputLabel}>Max (LKR)</Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="310"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Authority Source / Reference</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. HARTI / Dambulla Economic Center"
                  value={sourceReference}
                  onChangeText={setSourceReference}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.toggleVerifiedBtn,
                  isVerifiedGovt ? styles.toggleVerifiedActive : styles.toggleVerifiedInactive,
                ]}
                onPress={() => setIsVerifiedGovt(!isVerifiedGovt)}
              >
                <Ionicons
                  name={isVerifiedGovt ? 'shield-checkmark' : 'document-outline'}
                  size={16}
                  color={isVerifiedGovt ? '#FFFFFF' : Colors.text}
                />
                <Text
                  style={[
                    styles.toggleVerifiedText,
                    isVerifiedGovt ? { color: '#FFFFFF' } : { color: Colors.text },
                  ]}
                >
                  {isVerifiedGovt ? 'Verified Ministry Benchmark' : 'Demonstration / Sample Record'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveRecordBtn} onPress={handleSave}>
                <Text style={styles.saveRecordBtnText}>Save Benchmark Record</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    gap: 3,
  },
  addBtnText: {
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
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  districtChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  districtChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  priceCard: {
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
  cropTitleCol: {
    flex: 1,
  },
  cropTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  districtSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priceTriplet: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  priceCol: {
    flex: 1,
    alignItems: 'center',
  },
  priceColMid: {
    flex: 1.2,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 2,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  priceLabelMid: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceMin: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  priceAvg: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.secondary,
    marginTop: 1,
  },
  perKgText: {
    fontSize: 9,
    color: Colors.textSecondary,
  },
  priceMax: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
  },
  sourceCol: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  sourceVal: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  actionsRight: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBtnDelete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  modalBody: {
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 42,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  tripletInputs: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  smallInputGroup: {
    flex: 1,
    gap: 4,
  },
  smallInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    height: 42,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'center',
  },
  toggleVerifiedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
    borderWidth: 1,
  },
  toggleVerifiedActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleVerifiedInactive: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  toggleVerifiedText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  saveRecordBtn: {
    backgroundColor: '#D97706',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  saveRecordBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
});
