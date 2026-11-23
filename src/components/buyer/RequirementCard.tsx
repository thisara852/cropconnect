import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PurchaseRequirement } from '../../types/buyer';
import { Colors, Shadows } from '../../constants/theme';
import { useBuyer } from '../../context/BuyerContext';

interface RequirementCardProps {
  requirement: PurchaseRequirement;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({ requirement }) => {
  const router = useRouter();
  const { deleteRequirement } = useBuyer();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return { bg: Colors.farmerBg, text: Colors.farmer, border: '#C2E5D4' };
      case 'Fulfilled':
        return { bg: '#EBF3FB', text: Colors.info, border: '#BFDBFE' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
    }
  };

  const statusStyle = getStatusStyle(requirement.status);

  const handleDelete = () => {
    Alert.alert(
      'Delete Requirement',
      `Are you sure you want to delete requirement for "${requirement.cropName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRequirement(requirement.id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.card, Shadows.card]}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.cropTitle} numberOfLines={1}>
            {requirement.cropName}
          </Text>
          <Text style={styles.createdDate}>
            Posted {new Date(requirement.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{requirement.status}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Required Volume</Text>
          <Text style={styles.metricVal}>
            {requirement.quantityKg.toLocaleString()} <Text style={styles.metricUnit}>kg</Text>
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Target Ceiling Price</Text>
          <Text style={styles.metricPrice}>
            LKR {requirement.targetPricePerKg} <Text style={styles.metricUnit}>/kg</Text>
          </Text>
        </View>
      </View>

      {/* Details Meta */}
      <View style={styles.metaBox}>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaLabel}>Preferred District: </Text>
          <Text style={styles.metaValue}>{requirement.preferredDistrict}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaLabel}>Needed By: </Text>
          <Text style={styles.metaValue}>{requirement.requiredDate}</Text>
        </View>

        {requirement.additionalNotes ? (
          <Text style={styles.notesText} numberOfLines={2}>
            "{requirement.additionalNotes}"
          </Text>
        ) : null}
      </View>

      {/* Action Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/buyer/requirement-edit/${requirement.id}` as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={14} color={Colors.primary} />
          <Text style={styles.editBtnText}>Edit Requirement</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={15} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleGroup: {
    flex: 1,
    marginRight: 8,
  },
  cropTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  createdDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAF6',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEF3EA',
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  metricPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  metricUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  metaBox: {
    gap: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4EC',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F5F2',
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
