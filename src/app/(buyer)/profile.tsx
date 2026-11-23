import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useBuyer } from '../../context/BuyerContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function BuyerProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    offers,
    requirements,
    savedCropIds,
    unreadNotifsCount,
  } = useBuyer();

  const businessName = user?.businessName || user?.name || 'Lanka Fresh Supermarkets Ltd';
  const ownerName = user?.name || 'Sunil Perera';
  const email = user?.email || 'buyer@cropconnect.lk';
  const phone = user?.phone || '+94 77 123 4567';
  const district = user?.district || 'Colombo';
  const address = user?.businessAddress || 'No 45, Baseline Road, Colombo 09';
  const businessType = user?.businessType || 'Supermarket Chain / Exporter';

  const acceptedDealsCount = offers.filter((o) => o.status === 'Accepted').length;
  const activeOffersCount = offers.filter((o) => o.status === 'Pending').length;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your CROPCONNECT Buyer account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login' as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
              }}
              style={styles.avatar}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.businessName}>{businessName}</Text>
          <Text style={styles.ownerTitle}>Proprietor: {ownerName}</Text>

          <View style={styles.tagRow}>
            <View style={styles.typeBadge}>
              <Ionicons name="business-outline" size={12} color={Colors.secondary} />
              <Text style={styles.typeText}>{businessType}</Text>
            </View>
            <View style={styles.districtBadge}>
              <Ionicons name="location-outline" size={12} color={Colors.primary} />
              <Text style={styles.districtText}>{district}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statBox, Shadows.card]}
            onPress={() => router.push('/(buyer)/offers' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.statNum}>{activeOffersCount}</Text>
            <Text style={styles.statLabel}>Active Offers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statBox, Shadows.card]}
            onPress={() => router.push('/(buyer)/offers' as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.statNum, { color: Colors.secondary }]}>
              {acceptedDealsCount}
            </Text>
            <Text style={styles.statLabel}>Accepted Deals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statBox, Shadows.card]}
            onPress={() => router.push('/(buyer)/requirements' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.statNum}>{requirements.length}</Text>
            <Text style={styles.statLabel}>Requirements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statBox, Shadows.card]}
            onPress={() => router.push('/buyer/saved' as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.statNum, { color: Colors.orange }]}>
              {savedCropIds.length}
            </Text>
            <Text style={styles.statLabel}>Saved Crops</Text>
          </TouchableOpacity>
        </View>

        {/* Contact & Location Info */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="mail-outline" size={16} color={Colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Official Email</Text>
              <Text style={styles.infoVal}>{email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="call-outline" size={16} color={Colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Direct Phone</Text>
              <Text style={styles.infoVal}>{phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="navigate-outline" size={16} color={Colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Operating Facility Address</Text>
              <Text style={styles.infoVal}>{address}</Text>
            </View>
          </View>
        </View>

        {/* Menu Navigation Items */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.sectionTitle}>Buyer Sourcing Hub</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/buyer/saved' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="bookmark" size={18} color={Colors.orange} />
            </View>
            <Text style={styles.menuLabel}>Bookmarked Crop Listings</Text>
            <View style={styles.menuRight}>
              <Text style={styles.menuBadgeText}>{savedCropIds.length} items</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/buyer/farmers' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.farmerBg }]}>
              <Ionicons name="people" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.menuLabel}>Find & Contact Farmers</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/buyer/notifications' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="notifications" size={18} color={Colors.info} />
            </View>
            <Text style={styles.menuLabel}>Trade & Offer Notifications</Text>
            <View style={styles.menuRight}>
              {unreadNotifsCount > 0 ? (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadNotifsCount}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/auth/profile-setup' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="settings-outline" size={18} color={Colors.text} />
            </View>
            <Text style={styles.menuLabel}>Edit Business Profile</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out of Buyer Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>CROPCONNECT v1.0.0 • Fair-Price Agricultural Network</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.border,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  businessName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  ownerTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.farmerBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  typeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  districtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  districtText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNum: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
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
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  infoIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.farmerBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  infoVal: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  notifBadge: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});
