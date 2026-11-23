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
import { FarmerLead } from '../../types/buyer';
import { Colors, Shadows } from '../../constants/theme';

interface FarmerCardProps {
  farmer: FarmerLead;
}

export const FarmerCard: React.FC<FarmerCardProps> = ({ farmer }) => {
  const router = useRouter();

  const handleCall = () => {
    Linking.openURL(`tel:${farmer.phone}`).catch(() => {});
  };

  return (
    <View style={[styles.card, Shadows.card]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Image source={{ uri: farmer.avatarUrl }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.farmerName}>{farmer.name}</Text>
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={Colors.textMuted} />
            <Text style={styles.locationText}>
              {farmer.village ? `${farmer.village}, ` : ''}{farmer.district}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Ionicons name="leaf" size={11} color={Colors.primary} />
              <Text style={styles.statPillText}>{farmer.activeListingsCount} Active Lots</Text>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color={Colors.orange} />
              <Text style={styles.ratingText}>{farmer.rating}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Available Crops Chips */}
      <View style={styles.cropsSection}>
        <Text style={styles.cropsLabel}>CULTIVATING & SUPPLYING:</Text>
        <View style={styles.cropsWrap}>
          {farmer.cropsOffered.map((crop, i) => (
            <View key={i} style={styles.cropChip}>
              <Text style={styles.cropChipText}>{crop}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bio snippet */}
      {farmer.bio ? (
        <Text style={styles.bioText} numberOfLines={2}>
          "{farmer.bio}"
        </Text>
      ) : null}

      {/* Actions Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.7}>
          <Ionicons name="call" size={14} color={Colors.white} />
          <Text style={styles.callBtnText}>Call Farmer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push(`/buyer/farmer/${farmer.id}` as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.profileBtnText}>Farmer Profile & Crops</Text>
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
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#EAF6F0',
    borderWidth: 1.5,
    borderColor: '#C2E5D4',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F5F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  cropsSection: {
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  cropsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.orangeDark,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cropsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cropChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFE2CE',
  },
  cropChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
  },
  bioText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 12,
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
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F0F5F2',
    paddingVertical: 9,
    borderRadius: 10,
  },
  profileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
