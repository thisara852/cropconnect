import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBuyer } from '../../../context/BuyerContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../constants/theme';

export default function BuyerCropDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { crops, isCropSaved, toggleSaveCrop } = useBuyer();

  const crop = crops.find((c) => c.id === id);

  if (!crop) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.textMuted} />
        <Text style={styles.notFoundTitle}>Crop Listing Not Found</Text>
        <Text style={styles.notFoundSubtitle}>This listing may have been sold, withdrawn or expired.</Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Return to Marketplace</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const saved = isCropSaved(crop.id);
  const totalValue = crop.quantityKg * crop.pricePerKg;

  const handleCall = () => {
    const phoneNumber = crop.farmerPhone || '+94 77 987 6543';
    Alert.alert(
      'Contact Farmer',
      `Direct Call: ${crop.farmerName}\nPhone: ${phoneNumber}\nLocation: ${crop.village}, ${crop.district}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => Linking.openURL(`tel:${phoneNumber}`).catch(() => {
            Alert.alert('Error', 'Unable to initiate phone call on this device.');
          }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{crop.cropName}</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => toggleSaveCrop(crop.id)}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? Colors.orange : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Crop Image Banner */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: crop.imageUrl }} style={styles.cropImage} />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{crop.category}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{crop.status}</Text>
          </View>
        </View>

        {/* Title & Core Price Section */}
        <View style={[styles.mainCard, Shadows.card]}>
          <Text style={styles.cropTitle}>{crop.cropName}</Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Farmer Asking Price</Text>
              <Text style={styles.priceValue}>
                LKR {crop.pricePerKg} <Text style={styles.priceUnit}>/kg</Text>
              </Text>
            </View>
            <View style={styles.totalValueBox}>
              <Text style={styles.totalValueLabel}>Est. Total Lot Value</Text>
              <Text style={styles.totalValue}>LKR {totalValue.toLocaleString()}</Text>
            </View>
          </View>

          {/* Key Attributes Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Ionicons name="scale-outline" size={18} color={Colors.primary} />
              <Text style={styles.specLabel}>Available Lot</Text>
              <Text style={styles.specVal}>{crop.quantityKg.toLocaleString()} kg</Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <Text style={styles.specLabel}>Harvest Date</Text>
              <Text style={styles.specVal}>{crop.harvestDate}</Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.specLabel}>District</Text>
              <Text style={styles.specVal}>{crop.district}</Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="navigate-outline" size={18} color={Colors.primary} />
              <Text style={styles.specLabel}>Village</Text>
              <Text style={styles.specVal}>{crop.village}</Text>
            </View>
          </View>
        </View>

        {/* Farmer Information Card */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.sectionHeading}>Producer & Farm Origin</Text>
          <View style={styles.farmerRow}>
            <Image
              source={{
                uri:
                  crop.farmerAvatar ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
              }}
              style={styles.farmerAvatar}
            />
            <View style={styles.farmerDetails}>
              <View style={styles.farmerNameLine}>
                <Text style={styles.farmerName}>{crop.farmerName}</Text>
                <View style={styles.verifiedTag}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
                  <Text style={styles.verifiedTagText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.farmerLoc}>
                {crop.village}, {crop.district} District
              </Text>
              <Text style={styles.farmerPhone}>{crop.farmerPhone || '+94 77 987 6543'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.contactFarmerBtn}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={16} color={Colors.primary} />
            <Text style={styles.contactFarmerBtnText}>Contact Farmer via Phone</Text>
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.sectionHeading}>Harvest Quality & Notes</Text>
          <Text style={styles.descriptionText}>
            {crop.description ||
              'Freshly harvested directly from the fields. Grade-A sorting with minimal moisture and superior shelf-life. Ready for direct pickup or bulk transport coordination.'}
          </Text>
        </View>

        {/* Quality Guarantee Box */}
        <View style={styles.guaranteeBox}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.secondary} />
          <View style={styles.guaranteeTextCol}>
            <Text style={styles.guaranteeTitle}>Fair-Price Protection</Text>
            <Text style={styles.guaranteeDesc}>
              Make a fair offer aligned with regional market rates. Offers are sent immediately to the farmer for review.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookmarkActionBtn}
          onPress={() => toggleSaveCrop(crop.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? Colors.orange : Colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.makeOfferBtn}
          onPress={() => router.push(`/buyer/make-offer/${crop.id}` as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="pricetag" size={18} color="#FFFFFF" />
          <Text style={styles.makeOfferBtnText}>Make an Offer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  notFoundTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  notFoundSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  backBtnAction: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: Spacing.sm,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.border,
  },
  cropImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(23, 77, 55, 0.88)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  totalValueBox: {
    alignItems: 'flex-end',
  },
  totalValueLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.secondary,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  specBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  specVal: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeading: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  farmerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.border,
  },
  farmerDetails: {
    flex: 1,
  },
  farmerNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmerName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedTagText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
  farmerLoc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  farmerPhone: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  contactFarmerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.farmerBg,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    gap: 6,
  },
  contactFarmerBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  descriptionText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  guaranteeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  bookmarkActionBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  makeOfferBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  makeOfferBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
