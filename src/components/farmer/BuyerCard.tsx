import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BuyerLead } from '../../types/farmer';
import { Colors, Shadows } from '../../constants/theme';

interface BuyerCardProps {
  buyer: BuyerLead;
  onEnquire?: (buyer: BuyerLead) => void;
}

export const BuyerCard: React.FC<BuyerCardProps> = ({ buyer, onEnquire }) => {
  const router = useRouter();

  const handleCall = () => {
    Linking.openURL(`tel:${buyer.phone}`).catch(() => {
      // no phone app available
    });
  };

  return (
    <View style={[styles.card, Shadows.card]}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <Image source={{ uri: buyer.avatarUrl }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.businessName} numberOfLines={1}>
              {buyer.businessName}
            </Text>
            {buyer.verified && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
            )}
          </View>

          <Text style={styles.businessType}>{buyer.businessType}</Text>

          <View style={styles.metaRow}>
            <View style={styles.locationPill}>
              <Ionicons name="location" size={11} color={Colors.textMuted} />
              <Text style={styles.locationText}>{buyer.district}</Text>
            </View>

            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={11} color={Colors.secondary} />
              <Text style={styles.distanceText}>{buyer.distanceKm} km away</Text>
            </View>

            <View style={styles.ratingBox}>
              <Ionicons name="star" size={11} color={Colors.orange} />
              <Text style={styles.ratingText}>{buyer.rating}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sourcing Requirement Box */}
      <View style={styles.demandBox}>
        <View style={styles.demandHeader}>
          <Text style={styles.demandLabel}>URGENTLY SOURCING</Text>
          <Text style={styles.priceCapText}>Up to LKR {buyer.maxPricePerKg}/kg</Text>
        </View>

        <View style={styles.demandContent}>
          <View style={styles.cropTag}>
            <Ionicons name="leaf" size={13} color={Colors.primary} />
            <Text style={styles.cropTagText}>{buyer.requiredCrop}</Text>
          </View>
          <Text style={styles.qtyNeededText}>
            Needs: <Text style={styles.qtyBold}>{buyer.requiredQuantityKg.toLocaleString()} kg</Text>
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={handleCall}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={14} color={Colors.white} />
          <Text style={styles.callBtnText}>Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push(`/farmer/buyer/${buyer.id}` as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.profileBtnText}>View Profile</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F0F5F2',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    flex: 1,
  },
  businessType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  demandBox: {
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3E4CD',
    marginBottom: 12,
  },
  demandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  demandLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.orangeDark,
    letterSpacing: 0.5,
  },
  priceCapText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  demandContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cropTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  qtyNeededText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  qtyBold: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingVertical: 9,
    borderRadius: 10,
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  profileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F0F5F2',
    paddingVertical: 9,
    borderRadius: 10,
  },
  profileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
