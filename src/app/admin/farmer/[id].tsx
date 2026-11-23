import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '../../../context/AdminContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../constants/theme';

export default function AdminFarmerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { farmers, updateFarmer, updateFarmerStatus } = useAdmin();

  const farmer = farmers.find((f) => f.id === id);

  const [name, setName] = useState(farmer?.name || '');
  const [phone, setPhone] = useState(farmer?.phone || '');
  const [email, setEmail] = useState(farmer?.email || '');
  const [district, setDistrict] = useState(farmer?.district || '');
  const [village, setVillage] = useState(farmer?.village || '');
  const [status, setStatus] = useState<'Active' | 'Suspended'>(
    farmer?.status || 'Active'
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!farmer) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.textMuted} />
        <Text style={styles.notFoundTitle}>Farmer Record Not Found</Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Return to Users Directory</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Farmer name cannot be blank.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Contact phone cannot be blank.');
      return;
    }

    try {
      setIsSaving(true);
      await updateFarmer(farmer.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        district: district.trim(),
        village: village.trim(),
        status,
      });

      Alert.alert('Success', 'Farmer account records updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update farmer information.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = status === 'Active' ? 'Suspended' : 'Active';
    Alert.alert(
      `${newStatus === 'Suspended' ? 'Suspend' : 'Activate'} Account`,
      `Set status to ${newStatus} for "${farmer.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'Suspended' ? 'Suspend' : 'Activate',
          style: newStatus === 'Suspended' ? 'destructive' : 'default',
          onPress: async () => {
            setStatus(newStatus);
            await updateFarmerStatus(farmer.id, newStatus);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Farmer Record Oversight</Text>
        <TouchableOpacity style={styles.statusToggleBtn} onPress={handleToggleStatus}>
          <Text style={styles.statusToggleBtnText}>
            {status === 'Active' ? 'Suspend' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Farmer Profile Hero */}
          <View style={[styles.heroCard, Shadows.card]}>
            <Image source={{ uri: farmer.avatarUrl }} style={styles.avatar} />
            <Text style={styles.farmerName}>{farmer.name}</Text>
            <Text style={styles.metaText}>
              Registered {farmer.registrationDate} • ID: {farmer.id}
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="leaf-outline" size={16} color={Colors.secondary} />
                <Text style={styles.statVal}>{farmer.listingsCount}</Text>
                <Text style={styles.statLabel}>Active Lots</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="scale-outline" size={16} color={Colors.primary} />
                <Text style={styles.statVal}>{farmer.totalSoldKg.toLocaleString()} kg</Text>
                <Text style={styles.statLabel}>Harvest Sold</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="star" size={16} color="#D97706" />
                <Text style={styles.statVal}>{farmer.rating} / 5.0</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>

          {/* Edit Form */}
          <View style={[styles.formCard, Shadows.card]}>
            <Text style={styles.formSectionTitle}>Account & Identity Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.textInput} value={name} onChangeText={setName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.textInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.textInput} value={email} onChangeText={setEmail} keyboardType="email-address" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>District</Text>
              <TextInput style={styles.textInput} value={district} onChangeText={setDistrict} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Village / Agrarian Division</Text>
              <TextInput style={styles.textInput} value={village} onChangeText={setVillage} />
            </View>

            {/* Status Radio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Governance Status</Text>
              <View style={styles.statusRow}>
                <TouchableOpacity
                  style={[styles.statusOption, status === 'Active' && styles.statusOptionActive]}
                  onPress={() => setStatus('Active')}
                >
                  <Text style={[styles.statusOptionText, status === 'Active' && styles.statusOptionTextActive]}>
                    Active
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusOption, status === 'Suspended' && styles.statusOptionSuspended]}
                  onPress={() => setStatus('Suspended')}
                >
                  <Text style={[styles.statusOptionText, status === 'Suspended' && { color: '#FFFFFF' }]}>
                    Suspended
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>
              {isSaving ? 'Updating Record...' : 'Save Farmer Details'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    marginVertical: Spacing.md,
  },
  backBtnAction: {
    backgroundColor: '#0F172A',
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
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusToggleBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  statusToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
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
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  farmerName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textMuted,
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  formSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  statusOptionSuspended: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  statusOptionText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.md,
  },
});
