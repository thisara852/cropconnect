import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFarmer } from '../../../context/FarmerContext';
import { Colors, Shadows } from '../../../constants/theme';
import { Header } from '../../../components/common/Header';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

export default function BuyerDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { buyers, crops, sendBuyerEnquiry } = useFarmer();

  const buyer = buyers.find(b => b.id === id);

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(crops[0]?.cropName || 'Big Onion');
  const [enquiryMessage, setEnquiryMessage] = useState(
    `Ayubowan, I have available stock of ${crops[0]?.cropName || 'harvest'} ready for wholesale dispatch from our farm.`
  );
  const [isSending, setIsSending] = useState(false);

  if (!buyer) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Buyer Details" />
        <View style={styles.centerBox}>
          <Text style={styles.errorTitle}>Buyer enterprise not found.</Text>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${buyer.phone}`).catch(() => {});
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${buyer.email}`).catch(() => {});
  };

  const handleSendEnquiry = async () => {
    if (!enquiryMessage.trim()) {
      Alert.alert('Required', 'Please enter your message.');
      return;
    }

    setIsSending(true);
    try {
      await sendBuyerEnquiry(buyer.id, enquiryMessage, selectedCrop);
      setShowEnquiryModal(false);
      Alert.alert(
        'Enquiry Sent',
        `Your direct enquiry for ${selectedCrop} was delivered to ${buyer.businessName}. They will contact you shortly via phone/WhatsApp.`
      );
    } catch {
      Alert.alert('Error', 'Unable to send enquiry at this time.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={buyer.businessName}
        subtitle={`${buyer.businessType} • ${buyer.district}`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, Shadows.card]}>
          <Image source={{ uri: buyer.avatarUrl }} style={styles.avatar} />

          <View style={styles.verifiedRow}>
            <Text style={styles.businessTitle}>{buyer.businessName}</Text>
            {buyer.verified && (
              <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
            )}
          </View>

          <Text style={styles.businessSub}>{buyer.businessType}</Text>

          <View style={styles.ratingDistanceRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color={Colors.orange} />
              <Text style={styles.ratingText}>{buyer.rating} / 5.0 Rating</Text>
            </View>

            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={13} color={Colors.secondary} />
              <Text style={styles.distanceText}>{buyer.distanceKm} km from you</Text>
            </View>
          </View>
        </View>

        {/* Immediate Purchasing Requirement */}
        <View style={styles.demandSection}>
          <Text style={styles.sectionHeading}>Current Sourcing Requirement</Text>

          <View style={styles.demandBox}>
            <View style={styles.demandTop}>
              <View style={styles.cropPill}>
                <Ionicons name="leaf" size={14} color={Colors.primary} />
                <Text style={styles.cropPillText}>{buyer.requiredCrop}</Text>
              </View>
              <Text style={styles.demandPriceText}>Max: LKR {buyer.maxPricePerKg}/kg</Text>
            </View>

            <Text style={styles.demandQuantity}>
              Batch Volume Required: <Text style={styles.boldText}>{buyer.requiredQuantityKg.toLocaleString()} kg</Text>
            </Text>

            <View style={styles.notesDivider} />
            <Text style={styles.notesLabel}>Purchasing Criteria & Terms:</Text>
            <Text style={styles.notesText}>{buyer.purchasingNotes}</Text>
          </View>
        </View>

        {/* Location & Contact Info */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeading}>Enterprise Contact Information</Text>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={18} color={Colors.secondary} />
            <View style={styles.detailTextGroup}>
              <Text style={styles.detailLabel}>Procurement Manager</Text>
              <Text style={styles.detailValue}>{buyer.ownerName}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={18} color={Colors.secondary} />
            <View style={styles.detailTextGroup}>
              <Text style={styles.detailLabel}>Direct Phone / WhatsApp</Text>
              <Text style={styles.detailValue}>{buyer.phone}</Text>
            </View>
            <TouchableOpacity style={styles.quickCallPill} onPress={handleCall}>
              <Ionicons name="call" size={12} color={Colors.white} />
              <Text style={styles.quickCallPillText}>Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={18} color={Colors.secondary} />
            <View style={styles.detailTextGroup}>
              <Text style={styles.detailLabel}>Business Email</Text>
              <Text style={styles.detailValue}>{buyer.email}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={Colors.secondary} />
            <View style={styles.detailTextGroup}>
              <Text style={styles.detailLabel}>Warehouse / Distribution Centre</Text>
              <Text style={styles.detailValue}>{buyer.address}, {buyer.district}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Send Direct Harvest Enquiry"
            variant="primary"
            size="large"
            iconName="chatbubbles"
            iconPosition="left"
            onPress={() => setShowEnquiryModal(true)}
          />

          <Button
            title={`Call Procurement Office (${buyer.phone})`}
            variant="outline"
            size="large"
            iconName="call-outline"
            iconPosition="left"
            onPress={handleCall}
          />
        </View>
      </ScrollView>

      {/* Send Enquiry Modal */}
      <Modal
        visible={showEnquiryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEnquiryModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Harvest Enquiry</Text>
            <TouchableOpacity onPress={() => setShowEnquiryModal(false)}>
              <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>
              To: <Text style={{ fontWeight: '700', color: Colors.textDark }}>{buyer.businessName}</Text>
            </Text>

            {/* Select Crop From My Crops */}
            <View style={styles.cropPickSection}>
              <Text style={styles.pickerLabel}>Offer From Your Crop Listings:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsRow}>
                {crops.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.cropSelectChip, selectedCrop === c.cropName && styles.cropSelectChipActive]}
                    onPress={() => setSelectedCrop(c.cropName)}
                  >
                    <Text
                      style={[
                        styles.cropSelectChipText,
                        selectedCrop === c.cropName && styles.cropSelectChipTextActive,
                      ]}
                    >
                      {c.cropName} ({c.quantityKg}kg)
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Input
              label="Enquiry Message & Offer Details"
              value={enquiryMessage}
              onChangeText={setEnquiryMessage}
              multiline
              numberOfLines={4}
              placeholder="State quantity, harvest condition, ready date and transport preferences..."
            />

            <Button
              title="Dispatch Enquiry"
              variant="primary"
              size="large"
              isLoading={isSending}
              iconName="send"
              onPress={handleSendEnquiry}
              style={{ marginTop: 12 }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 16,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F5F2',
    marginBottom: 10,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  businessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  businessSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF4E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.orangeDark,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  demandSection: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demandBox: {
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3E4CD',
  },
  demandTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cropPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  demandPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  demandQuantity: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  boldText: {
    fontWeight: '800',
    color: Colors.textDark,
  },
  notesDivider: {
    height: 1,
    backgroundColor: '#EFE2CE',
    marginVertical: 8,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.orangeDark,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textDark,
    lineHeight: 17,
  },
  sectionBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailTextGroup: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 2,
  },
  quickCallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quickCallPillText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F0F4EC',
    marginVertical: 12,
  },
  actionsContainer: {
    gap: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  cropPickSection: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  cropsRow: {
    flexDirection: 'row',
  },
  cropSelectChip: {
    backgroundColor: '#F0F4EC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropSelectChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cropSelectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cropSelectChipTextActive: {
    color: Colors.white,
  },
});
