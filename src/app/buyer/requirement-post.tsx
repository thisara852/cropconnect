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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBuyer } from '../../context/BuyerContext';
import { useAuth } from '../../context/AuthContext';
import { CropCategory } from '../../types/farmer';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

const CATEGORIES: CropCategory[] = ['Vegetables', 'Fruits', 'Grains & Paddy', 'Spices', 'Tubers & Roots'];

const DISTRICTS = [
  'Dambulla',
  'Anuradhapura',
  'Nuwara Eliya',
  'Kandy',
  'Kurunegala',
  'Badulla',
  'Ratnapura',
  'Jaffna',
  'Matale',
  'Hambantota',
  'Colombo',
  'Gampaha',
];

export default function PostRequirementScreen() {
  const router = useRouter();
  const { createRequirement } = useBuyer();
  const { user } = useAuth();

  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Vegetables');
  const [quantityKg, setQuantityKg] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [preferredDistrict, setPreferredDistrict] = useState(user?.district || 'Dambulla');
  const [requiredDate, setRequiredDate] = useState('Within 7 days');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+94 77 123 4567');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!cropName.trim()) {
      Alert.alert('Validation Error', 'Please specify the crop name required (e.g. Red Onions).');
      return;
    }
    const numQty = parseFloat(quantityKg);
    if (!quantityKg || isNaN(numQty) || numQty <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid required quantity in kg.');
      return;
    }
    const numPrice = parseFloat(targetPrice);
    if (!targetPrice || isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Validation Error', 'Please enter a target ceiling price per kg (LKR).');
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert('Validation Error', 'Please provide a valid contact phone number.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createRequirement({
        cropName: cropName.trim(),
        category,
        quantityKg: numQty,
        targetPricePerKg: numPrice,
        preferredDistrict,
        requiredDate: requiredDate.trim() || 'Immediate / Within 1 week',
        additionalNotes: additionalNotes.trim(),
        contactPhone: contactPhone.trim(),
        status: 'Active',
      });

      Alert.alert(
        'Requirement Broadcasted!',
        `Your purchase requirement for ${cropName} (${numQty.toLocaleString()} kg at target LKR ${numPrice}/kg) has been posted. Farmers across Sri Lanka can now view your demand.`,
        [
          {
            text: 'View Requirements',
            onPress: () => router.replace('/(buyer)/requirements' as any),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to post requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Post Requirement</Text>
          <Text style={styles.headerSubtitle}>Publish bulk sourcing demand to local farmers</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Informational Banner */}
          <View style={styles.banner}>
            <Ionicons name="megaphone-outline" size={24} color={Colors.primary} />
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Instant Farmer Broadcast</Text>
              <Text style={styles.bannerDesc}>
                Post your target quantity and ceiling price. Farmers looking to harvest or sell immediately will contact you directly.
              </Text>
            </View>
          </View>

          <View style={[styles.formCard, Shadows.card]}>
            {/* Crop Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Crop Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="leaf-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Red Onions, Big Carrots, Green Chillies"
                  placeholderTextColor={Colors.textMuted}
                  value={cropName}
                  onChangeText={setCropName}
                />
              </View>
            </View>

            {/* Category selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.categoryWrap}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryBtn, isSelected && styles.categoryBtnActive]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.categoryBtnText, isSelected && styles.categoryBtnTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quantity Required */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Required Quantity (kg) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="scale-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 5000"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={quantityKg}
                  onChangeText={setQuantityKg}
                />
                <Text style={styles.inputSuffix}>kg</Text>
              </View>
            </View>

            {/* Target Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Target Ceiling Price (LKR per kg) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="pricetag-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 280"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                />
                <Text style={styles.inputSuffix}>LKR/kg</Text>
              </View>
            </View>

            {/* Preferred District */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Preferred Production District <Text style={styles.required}>*</Text>
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.districtChips}
              >
                {DISTRICTS.map((dist) => {
                  const isSelected = preferredDistrict === dist;
                  return (
                    <TouchableOpacity
                      key={dist}
                      style={[styles.districtChip, isSelected && styles.districtChipActive]}
                      onPress={() => setPreferredDistrict(dist)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.districtChipText, isSelected && styles.districtChipTextActive]}>
                        {dist}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Required Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery / Procurement Deadline</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. By end of week / Nov 30"
                  placeholderTextColor={Colors.textMuted}
                  value={requiredDate}
                  onChangeText={setRequiredDate}
                />
              </View>
            </View>

            {/* Contact Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Contact Phone for Farmers <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="+94 77 xxx xxxx"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                />
              </View>
            </View>

            {/* Additional Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quality Specs & Logistics Terms</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                placeholder="e.g. Must be Grade 1 sorting, dried properly. Farmgate pickup available or Dambulla warehouse delivery."
                placeholderTextColor={Colors.textMuted}
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
              />
            </View>
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Posting Requirement...' : 'Publish Purchase Requirement'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.farmerBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  bannerDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  formCard: {
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
  required: {
    color: '#DC2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 46,
    gap: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  inputSuffix: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  categoryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  districtChips: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  districtChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  districtChipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  districtChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.md,
  },
});
