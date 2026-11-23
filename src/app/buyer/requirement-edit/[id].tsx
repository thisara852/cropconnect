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
import { useBuyer } from '../../../context/BuyerContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../constants/theme';

export default function EditRequirementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { requirements, updateRequirement, deleteRequirement } = useBuyer();

  const requirement = requirements.find((r) => r.id === id);

  const [cropName, setCropName] = useState(requirement?.cropName || '');
  const [quantityKg, setQuantityKg] = useState(
    requirement ? String(requirement.quantityKg) : ''
  );
  const [targetPrice, setTargetPrice] = useState(
    requirement ? String(requirement.targetPricePerKg) : ''
  );
  const [preferredDistrict, setPreferredDistrict] = useState(
    requirement?.preferredDistrict || 'Dambulla'
  );
  const [requiredDate, setRequiredDate] = useState(
    requirement?.requiredDate || ''
  );
  const [contactPhone, setContactPhone] = useState(
    requirement?.contactPhone || ''
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    requirement?.additionalNotes || ''
  );
  const [status, setStatus] = useState<'Active' | 'Fulfilled' | 'Closed'>(
    requirement?.status || 'Active'
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!requirement) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.textMuted} />
        <Text style={styles.notFoundTitle}>Requirement Not Found</Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    const numQty = parseFloat(quantityKg);
    const numPrice = parseFloat(targetPrice);

    if (!cropName.trim()) {
      Alert.alert('Validation Error', 'Crop name cannot be empty.');
      return;
    }
    if (isNaN(numQty) || numQty <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity.');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target price.');
      return;
    }

    try {
      setIsSaving(true);
      await updateRequirement(requirement.id, {
        cropName: cropName.trim(),
        quantityKg: numQty,
        targetPricePerKg: numPrice,
        preferredDistrict,
        requiredDate: requiredDate.trim(),
        contactPhone: contactPhone.trim(),
        additionalNotes: additionalNotes.trim(),
        status,
      });

      Alert.alert('Success', 'Purchase requirement updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update requirement.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Requirement', 'Are you sure you want to delete this requirement?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRequirement(requirement.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Requirement</Text>
        <TouchableOpacity style={styles.deleteHeaderBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, Shadows.card]}>
            {/* Status Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Requirement Status</Text>
              <View style={styles.statusRow}>
                {(['Active', 'Fulfilled', 'Closed'] as const).map((s) => {
                  const isSel = status === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusOption, isSel && styles.statusOptionActive]}
                      onPress={() => setStatus(s)}
                    >
                      <Text style={[styles.statusOptionText, isSel && styles.statusOptionTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Crop Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Crop Name</Text>
              <TextInput
                style={styles.textInput}
                value={cropName}
                onChangeText={setCropName}
              />
            </View>

            {/* Quantity */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity (kg)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={quantityKg}
                onChangeText={setQuantityKg}
              />
            </View>

            {/* Target Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Price (LKR per kg)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={targetPrice}
                onChangeText={setTargetPrice}
              />
            </View>

            {/* Preferred District */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred District</Text>
              <TextInput
                style={styles.textInput}
                value={preferredDistrict}
                onChangeText={setPreferredDistrict}
              />
            </View>

            {/* Delivery Deadline */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery Deadline</Text>
              <TextInput
                style={styles.textInput}
                value={requiredDate}
                onChangeText={setRequiredDate}
              />
            </View>

            {/* Contact Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
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
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
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
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
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
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusOptionText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
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
