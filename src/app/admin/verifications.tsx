import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../context/AdminContext';
import { AdminBuyerUser } from '../../types/admin';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function BuyerVerificationScreen() {
  const router = useRouter();
  const { buyers, updateBuyerVerification } = useAdmin();

  const pendingBuyers = buyers.filter((b) => b.verificationStatus === 'Pending');

  const handleApprove = (buyer: AdminBuyerUser) => {
    Alert.alert(
      'Approve Commercial Buyer',
      `Grant verified status to "${buyer.businessName}"?\n\nThis permits unlimited bulk harvest bidding across all registered farmer listings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve Buyer',
          onPress: async () => {
            await updateBuyerVerification(buyer.id, 'Verified');
            Alert.alert('Verification Approved', `"${buyer.businessName}" has been successfully verified.`);
          },
        },
      ]
    );
  };

  const handleReject = (buyer: AdminBuyerUser) => {
    Alert.alert(
      'Reject Verification',
      `Reject verification application for "${buyer.businessName}"?\n\nThe applicant will receive a notice to re-upload authentic commercial registration documentation.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject Application',
          style: 'destructive',
          onPress: async () => {
            await updateBuyerVerification(buyer.id, 'Rejected');
            Alert.alert('Verification Rejected', `"${buyer.businessName}" status set to Rejected.`);
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
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Buyer Verification Queue</Text>
          <Text style={styles.headerSubtitle}>
            {pendingBuyers.length} corporate verification request{pendingBuyers.length === 1 ? '' : 's'} pending review
          </Text>
        </View>
      </View>

      <FlatList
        data={pendingBuyers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, Shadows.card]}>
            {/* Header with Business Title */}
            <View style={styles.cardTop}>
              <View style={styles.iconCircle}>
                <Ionicons name="business" size={22} color="#D97706" />
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.businessName}>{item.businessName}</Text>
                <Text style={styles.ownerSubtitle}>
                  Proprietor: {item.ownerName} • {item.businessType}
                </Text>
              </View>
              <View style={styles.pendingTag}>
                <Text style={styles.pendingTagText}>PENDING</Text>
              </View>
            </View>

            {/* Document & Registration Details */}
            <View style={styles.docsBox}>
              <View style={styles.docRow}>
                <Ionicons name="ribbon-outline" size={16} color="#B45309" />
                <Text style={styles.docLabel}>Business Registration No (BRN):</Text>
                <Text style={styles.docVal}>{item.brnNumber}</Text>
              </View>

              <View style={styles.docRow}>
                <Ionicons name="document-attach-outline" size={16} color="#B45309" />
                <Text style={styles.docLabel}>Uploaded Credentials:</Text>
                <Text style={styles.docVal} numberOfLines={2}>
                  {item.documentsSubmitted}
                </Text>
              </View>

              <View style={styles.docRow}>
                <Ionicons name="location-outline" size={16} color="#B45309" />
                <Text style={styles.docLabel}>Operational Facility:</Text>
                <Text style={styles.docVal}>{item.businessAddress}</Text>
              </View>

              <View style={styles.docRow}>
                <Ionicons name="call-outline" size={16} color="#B45309" />
                <Text style={styles.docLabel}>Contact Phone / Email:</Text>
                <Text style={styles.docVal}>
                  {item.phone} • {item.email}
                </Text>
              </View>
            </View>

            {/* Decision Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => router.push(`/admin/buyer/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.viewBtnText}>Full Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleReject(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(item)}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="shield-checkmark-outline" size={48} color={Colors.secondary} />
            </View>
            <Text style={styles.emptyTitle}>Verification Queue Clear</Text>
            <Text style={styles.emptySubtitle}>
              All registered commercial buyers have been reviewed and processed. New enterprise signups requiring verification will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
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
    color: '#94A3B8',
    marginTop: 2,
  },
  listContent: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleCol: {
    flex: 1,
  },
  businessName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  ownerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pendingTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingTagText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },
  docsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flexWrap: 'wrap',
  },
  docLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  docVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  viewBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 4,
  },
  rejectBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#DC2626',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
    gap: 4,
  },
  approveBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EAF6F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
