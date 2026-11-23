import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '../../../context/AdminContext';
import { BuyerVerificationStatus } from '../../../types/admin';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../constants/theme';

export default function AdminBuyerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { buyers, updateBuyer, updateBuyerVerification } = useAdmin();

  const buyer = buyers.find((b) => b.id === id);

  const [businessName, setBusinessName] = useState(buyer?.businessName || '');
  const [ownerName, setOwnerName] = useState(buyer?.ownerName || '');
  const [phone, setPhone] = useState(buyer?.phone || '');
  const [email, setEmail] = useState(buyer?.email || '');
  const [district, setDistrict] = useState(buyer?.district || '');
  const [businessAddress, setBusinessAddress] = useState(buyer?.businessAddress || '');
  const [businessType, setBusinessType] = useState(buyer?.businessType || '');
  const [brnNumber, setBrnNumber] = useState(buyer?.brnNumber || '');
  const [documentsSubmitted, setDocumentsSubmitted] = useState(buyer?.documentsSubmitted || '');
  const [verificationStatus, setVerificationStatus] = useState<BuyerVerificationStatus>(
    buyer?.verificationStatus || 'Pending'
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!buyer) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.textMuted} />
        <Text style={styles.notFoundTitle}>Buyer Record Not Found</Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Return to Directory</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!businessName.trim()) {
      Alert.alert('Validation Error', 'Business name cannot be empty.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone number cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      await updateBuyer(buyer.id, {
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        district: district.trim(),
        businessAddress: businessAddress.trim(),
        businessType: businessType.trim(),
        brnNumber: brnNumber.trim(),
        documentsSubmitted: documentsSubmitted.trim(),
        verificationStatus,
      });

      Alert.alert('Success', 'Buyer commercial profile records updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save buyer details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerificationChange = (newStatus: BuyerVerificationStatus) => {
    Alert.alert('Update Verification Status', `Change status to ${newStatus}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setVerificationStatus(newStatus);
          await updateBuyerVerification(buyer.id, newStatus);
        },
      },
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
        <Text style={styles.headerTitle}>Buyer Corporate Oversight</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View style={[styles.heroCard, Shadows.card]}>
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={32} color="#D97706" />
            </View>
            <Text style={styles.businessTitle}>{buyer.businessName}</Text>
            <Text style={styles.ownerSubtitle}>
              Proprietor: {buyer.ownerName} • Registered {buyer.registrationDate}
            </Text>

            {/* Current Status Pill */}
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Status: {verificationStatus}</Text>
            </View>
          </View>

          {/* Verification Decision Action Buttons */}
          <View style={[styles.decisionCard, Shadows.card]}>
            <Text style={styles.formSectionTitle}>Verification Governance</Text>
            <View style={styles.decisionRow}>
              {(['Verified', 'Pending', 'Rejected', 'Suspended'] as BuyerVerificationStatus[]).map((st) => {
                const isSel = verificationStatus === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[styles.decisionBtn, isSel && styles.decisionBtnActive]}
                    onPress={() => handleVerificationChange(st)}
                  >
                    <Text style={[styles.decisionBtnText, isSel && styles.decisionBtnTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Form Fields */}
          <View style={[styles.formCard, Shadows.card]}>
            <Text style={styles.formSectionTitle}>Corporate Entity Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business / Enterprise Name</Text>
              <TextInput style={styles.textInput} value={businessName} onChangeText={setBusinessName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Proprietor / Managing Director</Text>
              <TextInput style={styles.textInput} value={ownerName} onChangeText={setOwnerName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Type</Text>
              <TextInput style={styles.textInput} value={businessType} onChangeText={setBusinessType} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Registration Number (BRN)</Text>
              <TextInput style={styles.textInput} value={brnNumber} onChangeText={setBrnNumber} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput style={styles.textInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Official Email</Text>
              <TextInput style={styles.textInput} value={email} onChangeText={setEmail} keyboardType="email-address" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>District</Text>
              <TextInput style={styles.textInput} value={district} onChangeText={setDistrict} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Operating Facility Address</Text>
              <TextInput style={styles.textInput} value={businessAddress} onChangeText={setBusinessAddress} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Submitted Verification Documents</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={documentsSubmitted}
                onChangeText={setDocumentsSubmitted}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>
              {isSaving ? 'Saving Changes...' : 'Save Buyer Records'}
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
  headerRightSpacer: {
    width: 38,
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  businessTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  ownerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: Colors.farmerBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  statusPillText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  decisionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  decisionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  decisionBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  decisionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  decisionBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.text,
    minHeight: 70,
    textAlignVertical: 'top',
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
