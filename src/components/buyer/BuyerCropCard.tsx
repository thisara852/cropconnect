import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CropListing } from '../../types/farmer';
import { Colors, Shadows } from '../../constants/theme';
import { useBuyer } from '../../context/BuyerContext';

interface BuyerCropCardProps {
  crop: CropListing;
  compact?: boolean;
  onPress?: () => void;
  onOfferPress?: () => void;
}

export const BuyerCropCard: React.FC<BuyerCropCardProps> = ({
  crop,
  compact = false,
  onPress,
  onOfferPress,
}) => {
  const router = useRouter();
  const { isCropSaved, toggleSaveCrop } = useBuyer();

  const isSaved = isCropSaved(crop.id);
  const handleCardPress = onPress || (() => router.push(`/buyer/crop/${crop.id}` as any));
  const handleOffer = onOfferPress || (() => router.push(`/buyer/make-offer/${crop.id}` as any));

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.card]}
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: crop.imageUrl }} style={styles.image} />

        {/* Category Badge */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{crop.category}</Text>
        </View>

        {/* Rescue Badge if applicable */}
        {crop.isRescue && (
          <View style={styles.rescueBadge}>
            <Ionicons name="flash" size={11} color={Colors.white} />
            <Text style={styles.rescueBadgeText}>RESCUE DEAL</Text>
          </View>
        )}

        {/* Save / Bookmark Button */}
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => toggleSaveCrop(crop.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved ? Colors.orange : Colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        {/* Title and Asking Price */}
        <View style={styles.titleRow}>
          <Text style={styles.cropTitle} numberOfLines={1}>
            {crop.cropName}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>LKR {crop.pricePerKg}</Text>
            <Text style={styles.priceUnit}>/kg</Text>
          </View>
        </View>

        {/* Farmer info and Location */}
        <View style={styles.farmerRow}>
          <Text style={styles.farmerName} numberOfLines={1}>
            Farmer: <Text style={styles.farmerBold}>{crop.farmerName}</Text>
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>
            {crop.village ? `${crop.village}, ` : ''}{crop.district} District
          </Text>
        </View>

        {/* Metrics Row: Volume, Harvest Date */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="cube-outline" size={13} color={Colors.secondary} />
            <Text style={styles.specText}>
              <Text style={styles.specBold}>{crop.quantityKg.toLocaleString()}</Text> kg available
            </Text>
          </View>

          <View style={styles.specItem}>
            <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
            <Text style={styles.specText}>Harvest: {crop.harvestDate}</Text>
          </View>
        </View>

        {/* Total Lot Value and Action Button */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.totalLabel}>Total Lot Est.</Text>
            <Text style={styles.totalValue}>
              LKR {(crop.quantityKg * crop.pricePerKg).toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.offerButton}
            onPress={handleOffer}
            activeOpacity={0.8}
          >
            <Ionicons name="pricetag" size={14} color={Colors.white} />
            <Text style={styles.offerButtonText}>Make Offer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#E2E8DE',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(23, 77, 55, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  rescueBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  rescueBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cropTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 1,
  },
  farmerRow: {
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  farmerBold: {
    fontWeight: '600',
    color: Colors.textDark,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specText: {
    fontSize: 12,
    color: Colors.textDark,
  },
  specBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  offerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  offerButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
