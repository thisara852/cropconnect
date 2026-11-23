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
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '../../context/AdminContext';
import { CropListing, CropStatus } from '../../types/farmer';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function AdminListingsScreen() {
  const { crops, updateCropStatus, removeCropListing } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Edit Listing Modal state
  const [editingCrop, setEditingCrop] = useState<CropListing | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editStatus, setEditStatus] = useState<CropStatus>('Active');

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const matchesSearch =
        crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || crop.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [crops, searchQuery, selectedCategory, selectedStatus]);

  const handleToggleListingStatus = (crop: CropListing) => {
    const newStatus: CropStatus = crop.status === 'Active' ? 'Sold' : 'Active';
    Alert.alert(
      'Change Listing Status',
      `Change status of "${crop.cropName}" from ${crop.status} to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await updateCropStatus(crop.id, newStatus);
          },
        },
      ]
    );
  };

  const handleDeleteListing = (crop: CropListing) => {
    Alert.alert(
      'Remove Inappropriate Listing',
      `Are you sure you want to permanently delete "${crop.cropName}" published by ${crop.farmerName}?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Listing',
          style: 'destructive',
          onPress: async () => {
            await removeCropListing(crop.id);
            Alert.alert('Listing Removed', 'The crop lot has been taken down from the platform.');
          },
        },
      ]
    );
  };

  const openEditModal = (crop: CropListing) => {
    setEditingCrop(crop);
    setEditPrice(String(crop.pricePerKg));
    setEditQuantity(String(crop.quantityKg));
    setEditStatus(crop.status);
  };

  const saveEdit = async () => {
    if (!editingCrop) return;
    await updateCropStatus(editingCrop.id, editStatus);
    setEditingCrop(null);
    Alert.alert('Success', 'Listing updated successfully.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crop Listings Governance</Text>
        <Text style={styles.headerSubtitle}>
          Moderate agricultural harvest lots published across Sri Lanka
        </Text>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by crop, farmer name, or district..."
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

      {/* Filter Category Tabs */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {['All', 'Vegetables', 'Fruits', 'Grains & Paddy', 'Spices', 'Tubers & Roots'].map((cat) => {
            const isSel = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isSel && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryChipText, isSel && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Listings FlatList */}
      <FlatList
        data={filteredCrops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isActive = item.status === 'Active';
          return (
            <View style={[styles.card, Shadows.card]}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: item.imageUrl }} style={styles.cropThumb} />
                <View style={styles.cropInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cropName} numberOfLines={1}>
                      {item.cropName}
                    </Text>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: isActive ? '#EAF6F0' : '#FEF3C7' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: isActive ? Colors.secondary : '#D97706' },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.farmerLine}>
                    Producer: <Text style={{ fontWeight: '700' }}>{item.farmerName}</Text> • {item.district}
                  </Text>
                  <Text style={styles.priceLine}>
                    Asking: <Text style={styles.priceHighlight}>LKR {item.pricePerKg}/kg</Text> • Available: {item.quantityKg} kg
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteListing(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={15} color="#DC2626" />
                  <Text style={styles.deleteBtnText}>Take Down</Text>
                </TouchableOpacity>

                <View style={styles.rightActions}>
                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={() => handleToggleListingStatus(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.toggleBtnText}>
                      {isActive ? 'Mark Inactive' : 'Mark Active'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditModal(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="pencil" size={13} color="#FFFFFF" />
                    <Text style={styles.editBtnText}>Moderate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Crop Listings Found</Text>
            <Text style={styles.emptySubtitle}>Try resetting filters or search query.</Text>
          </View>
        }
      />

      {/* Edit Listing Modal */}
      <Modal visible={!!editingCrop} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.floating]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Moderate Crop Listing</Text>
              <TouchableOpacity onPress={() => setEditingCrop(null)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {editingCrop && (
              <ScrollView contentContainerStyle={styles.modalBody}>
                <Text style={styles.modalCropName}>{editingCrop.cropName}</Text>
                <Text style={styles.modalFarmer}>Farmer: {editingCrop.farmerName} • {editingCrop.village}, {editingCrop.district}</Text>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Governed Listing Status</Text>
                  <View style={styles.statusOptionsRow}>
                    {(['Active', 'Under Offer', 'Sold', 'Rescue Alert'] as CropStatus[]).map((st) => {
                      const isSel = editStatus === st;
                      return (
                        <TouchableOpacity
                          key={st}
                          style={[styles.statusOpt, isSel && styles.statusOptActive]}
                          onPress={() => setEditStatus(st)}
                        >
                          <Text style={[styles.statusOptText, isSel && styles.statusOptTextActive]}>
                            {st}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <TouchableOpacity style={styles.modalSaveBtn} onPress={saveEdit}>
                  <Text style={styles.modalSaveBtnText}>Save Status Updates</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  categoryBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs + 2,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  card: {
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
  cropThumb: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.border,
  },
  cropInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  farmerLine: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceLine: {
    fontSize: FontSize.xs,
    color: Colors.text,
    marginTop: 2,
  },
  priceHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  rightActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  toggleBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: '#0F172A',
    gap: 4,
  },
  editBtnText: {
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
    maxHeight: '80%',
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
    gap: Spacing.md,
  },
  modalCropName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalFarmer: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  modalInputGroup: {
    gap: 6,
  },
  modalLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  statusOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  statusOpt: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusOptActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  statusOptText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusOptTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalSaveBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
});
