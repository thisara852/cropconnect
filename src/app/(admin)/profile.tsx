import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');

  const adminName = user?.name || 'Director General (Agri Oversight)';
  const adminEmail = user?.email || 'admin@cropconnect.gov.lk';
  const adminDept = user?.adminDepartment || 'Ministry of Agriculture & Plantation Industries';

  const handleLogout = () => {
    Alert.alert(
      'Admin Sign Out',
      'Are you sure you want to terminate this privileged administrative session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/welcome' as any);
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword || !securityPin) {
      Alert.alert('Validation Error', 'All credential fields including Security PIN are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.');
      return;
    }
    if (!/^\d{4}$/.test(securityPin)) {
      Alert.alert('Validation Error', 'Security PIN must be exactly 4 digits.');
      return;
    }

    setPasswordModalVisible(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSecurityPin('');
    Alert.alert('Security Credentials Updated', 'Your administrative passphrase and security PIN have been updated.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privileged Governance Console</Text>
        <Text style={styles.headerSubtitle}>
          National Agricultural Oversight & Market Integrity Authority
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Identity Card */}
        <View style={[styles.heroCard, Shadows.card]}>
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.avatar}
            />
            <View style={styles.shieldBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.govAuthorityTag}>
            <Text style={styles.govAuthorityText}>GOV.LK REGULATORY CLEARANCE</Text>
          </View>

          <Text style={styles.adminName}>{adminName}</Text>
          <Text style={styles.adminEmail}>{adminEmail}</Text>
          <Text style={styles.adminDept}>{adminDept}</Text>

          <View style={styles.securityPill}>
            <Ionicons name="lock-closed" size={12} color="#D97706" />
            <Text style={styles.securityPillText}>Access Tier: Super-Admin Full Platform Governance</Text>
          </View>
        </View>

        {/* Restricted Security Notice */}
        <View style={styles.noticeBox}>
          <Ionicons name="warning" size={20} color="#D97706" />
          <View style={styles.noticeTextCol}>
            <Text style={styles.noticeTitle}>Restricted Government Access</Text>
            <Text style={styles.noticeDesc}>
              Admin registration is permanently excluded from public onboarding. All administrative actions are timestamped and logged for ministry audits.
            </Text>
          </View>
        </View>

        {/* Administration Hub Shortcuts */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.sectionTitle}>Administrative Functions</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/verifications' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#D97706" />
            </View>
            <Text style={styles.menuLabel}>Commercial Buyer Verification Queue</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/prices' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#EAF6F0' }]}>
              <Ionicons name="trending-up" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.menuLabel}>Crop Price Benchmarks Management</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/complaints' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="chatbubbles" size={18} color="#DC2626" />
            </View>
            <Text style={styles.menuLabel}>Dispute & Complaint Tribunal</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/announcements' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="megaphone" size={18} color="#7C3AED" />
            </View>
            <Text style={styles.menuLabel}>Broadcast Platform Announcements</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/offers' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="eye" size={18} color="#0284C7" />
            </View>
            <Text style={styles.menuLabel}>Bilateral Offers Audit Monitor</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Security Credentials & Password */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.sectionTitle}>Account & Authentication Security</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setPasswordModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="key" size={18} color="#0F172A" />
            </View>
            <Text style={styles.menuLabel}>Change Administrative Passphrase & PIN</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Terminate Administrative Session</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          CROPCONNECT v1.0.0 • Gov.lk Agri Governance Engine
        </Text>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.floating]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Admin Credentials</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Passphrase</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  placeholder="Enter current passphrase"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Passphrase</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Passphrase</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  placeholder="Re-enter new passphrase"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>4-Digit Authorization Security PIN</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="e.g. 7492"
                  value={securityPin}
                  onChangeText={setSecurityPin}
                />
              </View>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleChangePassword}>
                <Text style={styles.modalSaveBtnText}>Confirm Credential Update</Text>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
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
  scrollContent: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  shieldBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D97706',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  govAuthorityTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  govAuthorityText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  adminEmail: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  adminDept: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 6,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  securityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noticeTextCol: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#92400E',
  },
  noticeDesc: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 14,
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
    marginBottom: Spacing.sm,
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
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
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
