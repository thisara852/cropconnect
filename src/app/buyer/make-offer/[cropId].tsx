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
import { useAuth } from '../../../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../constants/theme';

export default function MakeOfferScreen() {
  const { cropId } = useLocalSearchParams<{ cropId: string }>();
  const router = useRouter();
  const { crops, submitOffer } = useBuyer();
  const { user } = useAuth();

  const crop = crops.find((c) => c.id === cropId);

  const [offeredPrice, setOfferedPrice] = useState(
    crop ? String(crop.pricePerKg) : ''
  );
  const [requestedQuantity, setRequestedQuantity] = useState(
    crop ? String(crop.quantityKg) : ''
  );
  const [collectionDate, setCollectionDate] = useState('Within 3 days of acceptance');
  const [notes, setNotes] = useState('');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '+94 77 123 4567');
  const [buyerLocation, setBuyerLocation] = useState(
    user?.district ? `${user.district} (Buyer Depot)` : 'Colombo Logistics Center'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!crop) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.textMuted} />
        <Text style={styles.notFoundTitle}>Crop Listing Not Found</Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const numOfferedPrice = parseFloat(offeredPrice) || 0;
  const numRequestedQuantity = parseFloat(requestedQuantity) || 0;
  const totalOfferLKR = numOfferedPrice * numRequestedQuantity;

  const handleSubmit = async () => {
    if (!offeredPrice || isNaN(numOfferedPrice) || numOfferedPrice <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid offer price per kg (LKR).');
      return;
    }
    if (!requestedQuantity || isNaN(numRequestedQuantity) || numRequestedQuantity <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid requested quantity in kg.');
      return;
    }
    if (numRequestedQuantity > crop.quantityKg) {
      Alert.alert(
        'Quantity Exceeded',
        `The farmer only has ${crop.quantityKg} kg available. Please enter an amount up to this limit.`
      );
      return;
    }
    if (!buyerPhone.trim()) {
      Alert.alert('Validation Error', 'Please provide a contact phone number for the farmer.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitOffer({
        cropListingId: crop.id,
        cropName: crop.cropName,
        buyerLocation,
        buyerPhone,
        offeredPricePerKg: numOfferedPrice,
        requestedQuantityKg: numRequestedQuantity,
        collectionDate,
        notes: notes.trim(),
      });

      Alert.alert(
        'Offer Submitted Successfully!',
        `Your offer of LKR ${numOfferedPrice}/kg for ${numRequestedQuantity} kg (Total: LKR ${totalOfferLKR.toLocaleString()}) has been sent directly to ${crop.farmerName}.\n\nYou can track its status in "My Offers".`,
        [
          {
            text: 'View My Offers',
            onPress: () => router.replace('/(buyer)/offers' as any),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Submission Error', e.message || 'Failed to submit offer. Please try again.');
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
          <Text style={styles.headerTitle}>Make an Offer</Text>
          <Text style={styles.headerSubtitle}>Negotiate directly with {crop.farmerName}</Text>
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
          {/* Listing Snapshot Card */}
          <View style={[styles.snapshotCard, Shadows.card]}>
            <View style={styles.snapshotTop}>
              <View>
                <Text style={styles.snapshotCropName}>{crop.cropName}</Text>
                <Text style={styles.snapshotFarmer}>
                  Farmer: <Text style={{ fontWeight: '700' }}>{crop.farmerName}</Text> • {crop.district}
                </Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{crop.category}</Text>
              </View>
            </View>

            <View style={styles.snapshotGrid}>
              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Farmer Asking</Text>
                <Text style={styles.snapshotVal}>LKR {crop.pricePerKg}/kg</Text>
              </View>
              <View style={styles.snapshotDivider} />
              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Available Lot</Text>
                <Text style={styles.snapshotVal}>{crop.quantityKg} kg</Text>
              </View>
            </View>
          </View>

          {/* Offer Input Form */}
          <View style={[styles.formCard, Shadows.card]}>
            <Text style={styles.formSectionTitle}>Offer Terms & Pricing</Text>

            {/* Offered Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Your Offer Price (LKR per kg) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="pricetag-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={offeredPrice}
                  onChangeText={setOfferedPrice}
                  placeholder="e.g. 260"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.inputSuffix}>LKR/kg</Text>
              </View>
              {numOfferedPrice > 0 && (
                <Text style={styles.diffText}>
                  {numOfferedPrice >= crop.pricePerKg
                    ? `Matching or exceeding asking price (+LKR ${numOfferedPrice - crop.pricePerKg})`
                    : `Discount of LKR ${crop.pricePerKg - numOfferedPrice}/kg from asking price`}
                </Text>
              )}
            </View>

            {/* Requested Quantity */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Quantity Required (kg) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cube-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={requestedQuantity}
                  onChangeText={setRequestedQuantity}
                  placeholder={`Max ${crop.quantityKg}`}
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.inputSuffix}>kg</Text>
              </View>
            </View>

            {/* Calculated Total Payout Box */}
            <View style={styles.calcBox}>
              <Text style={styles.calcLabel}>Estimated Total Offer Value</Text>
              <Text style={styles.calcValue}>
                LKR {totalOfferLKR > 0 ? totalOfferLKR.toLocaleString() : '0'}
              </Text>
              <Text style={styles.calcSubtitle}>
                {numRequestedQuantity} kg × LKR {numOfferedPrice}/kg
              </Text>
            </View>

            {/* Collection / Delivery Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected Collection / Delivery Window</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  value={collectionDate}
                  onChangeText={setCollectionDate}
                  placeholder="e.g. Within 48 hours / 25 Nov 2026"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Buyer Contact Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Your Contact Phone <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  value={buyerPhone}
                  onChangeText={setBuyerPhone}
                  keyboardType="phone-pad"
                  placeholder="+94 77 xxx xxxx"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Buyer Depot Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Collection / Depot Location</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  value={buyerLocation}
                  onChangeText={setBuyerLocation}
                  placeholder="e.g. Dambulla Processing Hub"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Message to Farmer */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Note / Special Request for Farmer</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. We provide crates and lorry pickup. Immediate cash/bank transfer upon physical quality check."
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Transmitting Offer...' : 'Send Offer to Farmer'}
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
  snapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  snapshotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  snapshotCropName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  snapshotFarmer: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: Colors.farmerBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  snapshotGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  snapshotItem: {
    flex: 1,
    alignItems: 'center',
  },
  snapshotDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  snapshotLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  snapshotVal: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
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
  inputLabel: {
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
  diffText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '500',
  },
  calcBox: {
    backgroundColor: Colors.farmerBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  calcLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  calcValue: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
    marginVertical: 2,
  },
  calcSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.text,
    minHeight: 80,
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
