import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useFarmer } from '../../context/FarmerContext';
import { Colors } from '../../constants/theme';
import { RoleBadge } from '../../components/common/RoleBadge';

export default function FarmerProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { crops, offers } = useFarmer();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [rescueAlertsEnabled, setRescueAlertsEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'SI' | 'TA'>('EN');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of CROPCONNECT?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/welcome');
        },
      },
    ]);
  };

  const rescueLotsCount = crops.filter(c => c.isRescue).length;
  const totalVolumeKg = crops.reduce((acc, curr) => acc + curr.quantityKg, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Farmer Account</Text>
        <TouchableOpacity
          onPress={() => router.push('/profile-setup' as any)}
          style={styles.editHeaderBtn}
        >
          <Ionicons name="pencil" size={14} color={Colors.primary} />
          <Text style={styles.editHeaderText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Identity Card */}
        <View style={styles.identityCard}>
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1595956553066-fe24a8c33395?w=200&q=80',
            }}
            style={styles.avatar}
          />

          <View style={styles.badgeWrapper}>
            <RoleBadge role="farmer" size="medium" />
          </View>

          <Text style={styles.userName}>{user?.name || 'Sunil Bandara'}</Text>
          <Text style={styles.userLocation}>
            <Ionicons name="location" size={13} color={Colors.textMuted} />{' '}
            {user?.village ? `${user.village}, ` : ''}{user?.district || 'Anuradhapura'}
          </Text>

          {user?.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>"{user.bio}"</Text>
            </View>
          )}

          {/* Harvest Stats Ribbon */}
          <View style={styles.statsRibbon}>
            <View style={styles.ribbonItem}>
              <Text style={styles.ribbonNumber}>{crops.length}</Text>
              <Text style={styles.ribbonLabel}>Listings</Text>
            </View>

            <View style={styles.ribbonDivider} />

            <View style={styles.ribbonItem}>
              <Text style={styles.ribbonNumber}>{offers.length}</Text>
              <Text style={styles.ribbonLabel}>Offers</Text>
            </View>

            <View style={styles.ribbonDivider} />

            <View style={styles.ribbonItem}>
              <Text style={styles.ribbonNumber}>{(totalVolumeKg / 1000).toFixed(1)}t</Text>
              <Text style={styles.ribbonLabel}>Harvest Vol</Text>
            </View>

            <View style={styles.ribbonDivider} />

            <View style={styles.ribbonItem}>
              <Text style={[styles.ribbonNumber, { color: Colors.error }]}>{rescueLotsCount}</Text>
              <Text style={styles.ribbonLabel}>Rescued</Text>
            </View>
          </View>
        </View>

        {/* Contact Information Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeading}>Contact & Location</Text>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={Colors.secondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Direct Phone Number</Text>
              <Text style={styles.infoValue}>{user?.phone || '0771234567'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={Colors.secondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Account Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'farmer@cropconnect.lk'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="map-outline" size={18} color={Colors.secondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Farming Division & District</Text>
              <Text style={styles.infoValue}>
                {user?.village || 'Thambuttegama Track 4'}, {user?.district || 'Anuradhapura'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account & App Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeading}>App Preferences</Text>

          {/* Language Selector */}
          <View style={styles.settingItem}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Display Language</Text>
              <Text style={styles.settingSub}>Choose your preferred tongue</Text>
            </View>

            <View style={styles.langPills}>
              {(['EN', 'SI', 'TA'] as const).map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langPill, selectedLanguage === lang && styles.langPillActive]}
                  onPress={() => setSelectedLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.langPillText,
                      selectedLanguage === lang && styles.langPillTextActive,
                    ]}
                  >
                    {lang === 'EN' ? 'English' : lang === 'SI' ? 'සිංහල' : 'தமிழ்'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* Push Notifications Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Buyer Offer Alerts</Text>
              <Text style={styles.settingSub}>Immediate notifications for new buyer bids</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#CBD5E1', true: Colors.secondary }}
            />
          </View>

          <View style={styles.infoDivider} />

          {/* Rescue Alerts Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Urgent Distress Matching</Text>
              <Text style={styles.settingSub}>Broadcast surplus perishables to food processors</Text>
            </View>
            <Switch
              value={rescueAlertsEnabled}
              onValueChange={setRescueAlertsEnabled}
              trackColor={{ false: '#CBD5E1', true: Colors.orange }}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.push('/profile-setup' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={18} color={Colors.primary} />
            <Text style={styles.editProfileBtnText}>Edit Complete Profile & Farm Bio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.logoutBtnText}>Sign Out of CROPCONNECT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  identityCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#C2E5D4',
    backgroundColor: '#EAF6F0',
    marginBottom: 8,
  },
  badgeWrapper: {
    marginBottom: 6,
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textDark,
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  bioContainer: {
    backgroundColor: '#F8FAF6',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF3EA',
  },
  bioText: {
    fontSize: 12,
    color: Colors.textDark,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  statsRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F8FAF6',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EEF3EA',
  },
  ribbonItem: {
    flex: 1,
    alignItems: 'center',
  },
  ribbonNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  ribbonLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  ribbonDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F0F4EC',
    marginVertical: 12,
  },
  settingItem: {
    gap: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTextGroup: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  settingSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  langPills: {
    flexDirection: 'row',
    gap: 8,
  },
  langPill: {
    flex: 1,
    backgroundColor: '#F0F4EC',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  langPillTextActive: {
    color: Colors.white,
  },
  actionsContainer: {
    gap: 12,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  editProfileBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.errorBg,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
});
