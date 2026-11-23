import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBuyer } from '../../context/BuyerContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function BuyerNotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadNotifsCount,
    markNotificationAsRead,
    markAllNotificationsRead,
  } = useBuyer();

  const getIconForType = (type: string) => {
    switch (type) {
      case 'offer_accepted':
        return { name: 'checkmark-circle' as const, color: Colors.secondary, bg: Colors.farmerBg };
      case 'offer_rejected':
        return { name: 'close-circle' as const, color: '#DC2626', bg: '#FEF2F2' };
      case 'crop_match':
        return { name: 'sparkles' as const, color: Colors.orange, bg: '#FEF3C7' };
      default:
        return { name: 'notifications' as const, color: Colors.info, bg: '#E0F2FE' };
    }
  };

  const handleNotificationPress = async (id: string, targetId?: string, type?: string) => {
    await markNotificationAsRead(id);
    if (type === 'crop_match' && targetId) {
      router.push(`/buyer/crop/${targetId}` as any);
    } else if (type === 'offer_accepted' || type === 'offer_rejected') {
      router.push('/(buyer)/offers' as any);
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
            <Text style={styles.headerTitle}>Trade Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadNotifsCount > 0
                ? `${unreadNotifsCount} unread offer & market alerts`
                : 'All notifications caught up'}
            </Text>
          </View>
          {unreadNotifsCount > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={markAllNotificationsRead}
              activeOpacity={0.8}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const icon = getIconForType(item.type);
          return (
            <TouchableOpacity
              style={[
                styles.itemCard,
                Shadows.card,
                !item.read && styles.itemCardUnread,
              ]}
              onPress={() => handleNotificationPress(item.id, item.targetId, item.type)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
                <Ionicons name={icon.name} size={20} color={icon.color} />
              </View>

              <View style={styles.contentCol}>
                <View style={styles.titleRow}>
                  <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]}>
                    {item.title}
                  </Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.itemMessage}>{item.message}</Text>
                <Text style={styles.itemTimestamp}>{item.timestamp}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You have no active alerts. Offers made and match recommendations will appear here.
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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
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
  markAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  markAllText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  itemCardUnread: {
    backgroundColor: '#FAFDF9',
    borderColor: Colors.secondary,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: Colors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  itemMessage: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  itemTimestamp: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl * 1.5,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
