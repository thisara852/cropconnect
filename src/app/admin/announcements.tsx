import React, { useState } from 'react';
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
import { PlatformAnnouncement, TargetAudience } from '../../types/admin';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function AdminAnnouncementsScreen() {
  const router = useRouter();
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAdmin();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('All Users');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [authorName, setAuthorName] = useState('Director General of Agriculture');

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setTargetAudience('All Users');
    setPriority('Normal');
    setModalVisible(true);
  };

  const openEditModal = (a: PlatformAnnouncement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setMessage(a.message);
    setTargetAudience(a.targetAudience);
    setPriority(a.priority);
    setAuthorName(a.authorName);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Validation Error', 'Announcement title and message are required.');
      return;
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
      targetAudience,
      publishedDate: new Date().toISOString().split('T')[0],
      priority,
      authorName: authorName.trim() || 'Ministry of Agriculture',
      isActive: true,
    };

    if (editingId) {
      await updateAnnouncement(editingId, payload);
    } else {
      await createAnnouncement(payload);
    }

    setModalVisible(false);
    Alert.alert('Announcement Broadcasted', 'The announcement has been published to target participants.');
  };

  const handleDelete = (a: PlatformAnnouncement) => {
    Alert.alert('Delete Announcement', `Remove announcement "${a.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteAnnouncement(a.id);
        },
      },
    ]);
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Urgent':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'High':
        return { bg: '#FEF3C7', text: '#D97706' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
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
            <Text style={styles.headerTitle}>Platform Announcements</Text>
            <Text style={styles.headerSubtitle}>Broadcast policy notices, weather alerts & subsidies</Text>
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={openCreateModal} activeOpacity={0.85}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Broadcast</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const pStyle = getPriorityStyle(item.priority);
          return (
            <View style={[styles.card, Shadows.card]}>
              <View style={styles.cardHeader}>
                <View style={[styles.priorityPill, { backgroundColor: pStyle.bg }]}>
                  <Text style={[styles.priorityText, { color: pStyle.text }]}>{item.priority}</Text>
                </View>

                <View style={styles.audienceBadge}>
                  <Ionicons name="people-outline" size={11} color={Colors.textSecondary} />
                  <Text style={styles.audienceText}>Target: {item.targetAudience}</Text>
                </View>

                <Text style={styles.dateText}>{item.publishedDate}</Text>
              </View>

              <Text style={styles.announcementTitle}>{item.title}</Text>
              <Text style={styles.messageText}>{item.message}</Text>

              <View style={styles.footerRow}>
                <Text style={styles.authorText}>Author: {item.authorName}</Text>
                <View style={styles.actionsRight}>
                  <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionIconBtn}>
                    <Ionicons name="pencil-outline" size={16} color="#0F172A" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionIconBtnDelete}>
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Active Announcements</Text>
            <Text style={styles.emptySubtitle}>Tap Broadcast to send notices to farmers and buyers.</Text>
          </View>
        }
      />

      {/* Create / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.floating]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Announcement' : 'Publish Platform Announcement'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Announcement Headline</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Flash Flood Emergency Alert - Nuwara Eliya"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Audience</Text>
                <View style={styles.audienceOptions}>
                  {(['All Users', 'Farmers', 'Buyers'] as TargetAudience[]).map((aud) => {
                    const isSel = targetAudience === aud;
                    return (
                      <TouchableOpacity
                        key={aud}
                        style={[styles.audienceBtn, isSel && styles.audienceBtnActive]}
                        onPress={() => setTargetAudience(aud)}
                      >
                        <Text style={[styles.audienceBtnText, isSel && styles.audienceBtnTextActive]}>
                          {aud}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Priority Level</Text>
                <View style={styles.audienceOptions}>
                  {(['Normal', 'High', 'Urgent'] as const).map((pri) => {
                    const isSel = priority === pri;
                    return (
                      <TouchableOpacity
                        key={pri}
                        style={[styles.audienceBtn, isSel && styles.audienceBtnActive]}
                        onPress={() => setPriority(pri)}
                      >
                        <Text style={[styles.audienceBtnText, isSel && styles.audienceBtnTextActive]}>
                          {pri}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Broadcast Message Body</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  placeholder="Detailed instructions, relief provisions, or compliance notices..."
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Signing Authority</Text>
                <TextInput
                  style={styles.textInput}
                  value={authorName}
                  onChangeText={setAuthorName}
                />
              </View>

              <TouchableOpacity style={styles.publishBtn} onPress={handleSave}>
                <Text style={styles.publishBtnText}>Broadcast Announcement</Text>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    gap: 3,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priorityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  audienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  audienceText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dateText: {
    marginLeft: 'auto',
    fontSize: 10,
    color: Colors.textMuted,
  },
  announcementTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  messageText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
    marginTop: 2,
  },
  authorText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  actionsRight: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconBtnDelete: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
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
  audienceOptions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  audienceBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  audienceBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  audienceBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  audienceBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  publishBtn: {
    backgroundColor: '#D97706',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
});
