import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../context/AdminContext';
import { AdminComplaint, ComplaintStatus } from '../../types/admin';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function AdminComplaintsScreen() {
  const router = useRouter();
  const { complaints, updateComplaintStatus } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Response Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Under Review');

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.submittedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchQuery, selectedStatus]);

  const openActionModal = (c: AdminComplaint) => {
    setSelectedComplaint(c);
    setAdminResponseText(c.adminResponse || '');
    setNewStatus(c.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;
    await updateComplaintStatus(
      selectedComplaint.id,
      newStatus,
      adminResponseText.trim() || undefined
    );
    setSelectedComplaint(null);
    Alert.alert('Complaint Updated', `Ticket ${selectedComplaint.ticketNumber} status updated to ${newStatus}.`);
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'Resolved':
        return { bg: '#EAF6F0', text: Colors.secondary };
      case 'Under Review':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Rejected':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>Dispute & Complaint Tribunal</Text>
            <Text style={styles.headerSubtitle}>
              Resolve farmer-buyer trade disputes, quality grievances & logistics delays
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ticket number, user name, or keyword..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.filterBar}>
        {['All', 'Pending', 'Under Review', 'Resolved', 'Rejected'].map((st) => {
          const isSel = selectedStatus === st;
          return (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, isSel && styles.filterChipActive]}
              onPress={() => setSelectedStatus(st)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Complaints List */}
      <FlatList
        data={filteredComplaints}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const stStyle = getStatusColor(item.status);
          const isFarmer = item.userRole === 'farmer';
          return (
            <View style={[styles.card, Shadows.card]}>
              <View style={styles.cardTop}>
                <View style={styles.ticketPill}>
                  <Text style={styles.ticketText}>{item.ticketNumber}</Text>
                </View>

                <View style={[styles.roleBadge, { backgroundColor: isFarmer ? '#EAF6F0' : '#FDF4E7' }]}>
                  <Ionicons
                    name={isFarmer ? 'leaf' : 'business'}
                    size={11}
                    color={isFarmer ? Colors.secondary : Colors.orange}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      { color: isFarmer ? Colors.secondary : Colors.orange },
                    ]}
                  >
                    {isFarmer ? 'Farmer Dispute' : 'Buyer Dispute'}
                  </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: stStyle.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: stStyle.text }]}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.subjectText}>{item.subject}</Text>
              <Text style={styles.descText}>{item.description}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.submitterText}>
                  Filed by: <Text style={{ fontWeight: '700' }}>{item.submittedByName}</Text> ({item.submittedByPhone})
                </Text>
                <Text style={styles.dateText}>{item.submittedDate}</Text>
              </View>

              {item.adminResponse ? (
                <View style={styles.adminResponseBox}>
                  <Text style={styles.adminResponseTitle}>OFFICIAL ARBITRATION RESPONSE:</Text>
                  <Text style={styles.adminResponseText}>{item.adminResponse}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => openActionModal(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="hammer-outline" size={14} color="#FFFFFF" />
                <Text style={styles.reviewBtnText}>Arbitrate & Respond</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Complaints Found</Text>
            <Text style={styles.emptySubtitle}>All user disputes have been processed and resolved.</Text>
          </View>
        }
      />

      {/* Action / Response Modal */}
      <Modal visible={!!selectedComplaint} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.floating]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tribunal Arbitration</Text>
              <TouchableOpacity onPress={() => setSelectedComplaint(null)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {selectedComplaint && (
              <ScrollView contentContainerStyle={styles.modalBody}>
                <Text style={styles.modalTicket}>{selectedComplaint.ticketNumber}</Text>
                <Text style={styles.modalSubject}>{selectedComplaint.subject}</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Arbitration Decision Status</Text>
                  <View style={styles.statusSelectRow}>
                    {(['Pending', 'Under Review', 'Resolved', 'Rejected'] as ComplaintStatus[]).map((st) => {
                      const isSel = newStatus === st;
                      return (
                        <TouchableOpacity
                          key={st}
                          style={[styles.statusSelectBtn, isSel && styles.statusSelectBtnActive]}
                          onPress={() => setNewStatus(st)}
                        >
                          <Text
                            style={[
                              styles.statusSelectText,
                              isSel && styles.statusSelectTextActive,
                            ]}
                          >
                            {st}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Official Ministry Findings & Instructions</Text>
                  <TextInput
                    style={styles.responseArea}
                    multiline
                    numberOfLines={4}
                    placeholder="Enter official resolution, compensation guidance, or inquiry notes..."
                    value={adminResponseText}
                    onChangeText={setAdminResponseText}
                  />
                </View>

                <TouchableOpacity style={styles.submitResolutionBtn} onPress={handleUpdateStatus}>
                  <Text style={styles.submitResolutionBtnText}>Submit Tribunal Ruling</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs + 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ticketPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ticketText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subjectText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  descText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
  },
  submitterText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  dateText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  adminResponseBox: {
    backgroundColor: '#EAF6F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  adminResponseTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  adminResponseText: {
    fontSize: 11,
    color: Colors.textDark,
    marginTop: 2,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    gap: 4,
    marginTop: 4,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.xs,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl * 2,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
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
    gap: Spacing.md,
  },
  modalTicket: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: '#D97706',
  },
  modalSubject: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  statusSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  statusSelectBtn: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusSelectBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  statusSelectText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusSelectTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  responseArea: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitResolutionBtn: {
    backgroundColor: '#D97706',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitResolutionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
});
