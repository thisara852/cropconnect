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
import { BuyerCropCard } from '../../../components/buyer/BuyerCropCard';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../constants/theme';

export default function FarmerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { farmers, crops } = useBuyer();

  const farmer = farmers.find((f) => f.id === id);

  if (!farmer) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.textMuted} />
        <Text style={styles.notFoundTitle}>Farmer Profile Not Found</Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Return to Directory</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Find all active listings by this farmer
  const farmerCrops = crops.filter(
    (c) =>
      c.farmerId === farmer.id ||
      c.farmerName.toLowerCase() === farmer.name.toLowerCase()
  );

  const handleCall = () => {
    Alert.alert('Call Farmer', `Call ${farmer.name} at ${farmer.phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${farmer.phone}`).catch(() => {}) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{farmer.name}</Text>
        <TouchableOpacity style={styles.callHeaderBtn} onPress={handleCall}>
          <Ionicons name="call" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Card */}
        <View style={[styles.heroCard, Shadows.card]}>
          <Image source={{ uri: farmer.avatarUrl }} style={styles.avatar} />
          <View style={styles.heroNameRow}>
            <Text style={styles.farmerName}>{farmer.name}</Text>
            <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
          </View>
          <Text style={styles.locationText}>
            {farmer.village ? `${farmer.village}, ` : ''}{farmer.district} District
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="star" size={16} color={Colors.orange} />
              <Text style={styles.statVal}>{farmer.rating} / 5.0</Text>
              <Text style={styles.statLabel}>Farmer Rating</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="leaf" size={16} color={Colors.secondary} />
              <Text style={styles.statVal}>{farmer.activeListingsCount}</Text>
              <Text style={styles.statLabel}>Active Lots</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="scale" size={16} color={Colors.primary} />
              <Text style={styles.statVal}>{farmer.totalHarvestSoldKg?.toLocaleString() || '12,500'}</Text>
              <Text style={styles.statLabel}>Total kg Sold</Text>
            </View>
          </View>

          {/* Quick Call Action */}
          <TouchableOpacity style={styles.callActionBtn} onPress={handleCall} activeOpacity={0.85}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
            <Text style={styles.callActionText}>Contact Farmer ({farmer.phone})</Text>
          </TouchableOpacity>
        </View>

        {/* About & Bio */}
        {farmer.bio ? (
          <View style={[styles.sectionCard, Shadows.card]}>
            <Text style={styles.sectionTitle}>About the Farmer</Text>
            <Text style={styles.bioText}>{farmer.bio}</Text>
          </View>
        ) : null}

        {/* Crops Offered */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.sectionTitle}>Main Crops Cultivated</Text>
          <View style={styles.chipsWrap}>
            {farmer.cropsOffered.map((cropName, idx) => (
              <View key={idx} style={styles.chip}>
                <Ionicons name="leaf-outline" size={12} color={Colors.secondary} />
                <Text style={styles.chipText}>{cropName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Current Available Listings */}
        <View style={styles.listingsSection}>
          <View style={styles.listingsHeaderRow}>
            <Text style={styles.listingsTitle}>Current Listings by {farmer.name}</Text>
            <Text style={styles.listingsCount}>{farmerCrops.length} active</Text>
          </View>

          {farmerCrops.length > 0 ? (
            farmerCrops.map((c) => (
              <BuyerCropCard
                key={c.id}
                crop={c}
                onPress={() => router.push(`/buyer/crop/${c.id}` as any)}
                onOfferPress={() => router.push(`/buyer/make-offer/${c.id}` as any)}
              />
            ))
          ) : (
            <View style={styles.noCropsBox}>
              <Ionicons name="cube-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.noCropsText}>
                No listings actively available right now from this farmer. Contact directly to arrange advance orders.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  },
  notFoundTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: Spacing.md,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
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
  callHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmerName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  callActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  callActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  bioText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.farmerBg,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  chipText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  listingsSection: {
    gap: Spacing.sm,
  },
  listingsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingsTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  listingsCount: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    fontWeight: '600',
  },
  noCropsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  noCropsText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
