import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CropListing } from '../../types/farmer';
import { Colors, Shadows } from '../../constants/theme';

interface CropCardProps {
  crop: CropListing;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, onDelete, compact = false }) => {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Rescue Alert':
        return { bg: '#FEE2E2', text: Colors.error, border: '#FCA5A5', icon: 'flash' };
      case 'Active':
        return { bg: Colors.farmerBg, text: Colors.farmer, border: '#C2E5D4', icon: 'checkmark-circle' };
      case 'Under Offer':
        return { bg: Colors.buyerBg, text: Colors.orangeDark, border: '#FCD7A8', icon: 'time' };
      case 'Sold':
        return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1', icon: 'checkmark-done' };
      default:
        return { bg: Colors.farmerBg, text: Colors.farmer, border: '#C2E5D4', icon: 'leaf' };
    }
  };

  const statusStyle = getStatusColor(crop.status);

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to remove your listing for "${crop.cropName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete && onDelete(crop.id),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.card]}
      onPress={() => router.push(`/farmer/crop/${crop.id}` as any)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: crop.imageUrl }} style={styles.image} />
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Ionicons name={statusStyle.icon as any} size={11} color={statusStyle.text} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{crop.status}</Text>
        </View>

        {crop.isRescue && (
          <View style={styles.rescueFloatingTag}>
            <Ionicons name="alert" size={11} color={Colors.white} />
            <Text style={styles.rescueFloatingText}>RESCUE</Text>
          </View>
        )}

        {/* Offers Pill if any */}
        {crop.offersCount > 0 && (
          <TouchableOpacity
            style={styles.offersBadge}
            onPress={() => router.push(`/farmer/compare-offers/${crop.id}` as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles" size={12} color={Colors.white} />
            <Text style={styles.offersBadgeText}>
              {crop.offersCount} {crop.offersCount === 1 ? 'Offer' : 'Offers'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.categoryTag}>{crop.category}</Text>
          <Text style={styles.dateText}>
            {new Date(crop.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </Text>
        </View>

        <Text style={styles.cropTitle} numberOfLines={1}>
          {crop.cropName}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={Colors.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>
            {crop.village ? `${crop.village}, ` : ''}{crop.district}
          </Text>
        </View>

        {/* Price & Quantity Grid */}
        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Quantity</Text>
            <Text style={styles.metricValue}>
              {crop.quantityKg.toLocaleString()} <Text style={styles.metricUnit}>kg</Text>
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Expected Price</Text>
            <Text style={styles.metricPrice}>
              LKR {crop.pricePerKg} <Text style={styles.metricUnit}>/kg</Text>
            </Text>
          </View>
        </View>

        {!compact && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtnOutline}
              onPress={() => router.push(`/farmer/crop-edit/${crop.id}` as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={15} color={Colors.primary} />
              <Text style={styles.actionBtnOutlineText}>Edit</Text>
            </TouchableOpacity>

            {crop.offersCount > 0 ? (
              <TouchableOpacity
                style={styles.actionBtnOffers}
                onPress={() => router.push(`/farmer/compare-offers/${crop.id}` as any)}
                activeOpacity={0.7}
              >
                <Ionicons name="analytics" size={15} color={Colors.white} />
                <Text style={styles.actionBtnOffersText}>View Offers</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionBtnView}
                onPress={() => router.push(`/farmer/crop/${crop.id}` as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionBtnViewText}>Details</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={styles.deleteIconBtn}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#E2EBE5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  rescueFloatingTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rescueFloatingText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  offersBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.orangeDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  offersBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  cropTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
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
    flex: 1,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF6',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF3EA',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  metricPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4EC',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F5F2',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionBtnOffers: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.orange,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnOffersText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  actionBtnView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EAF6F0',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnViewText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  deleteIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
