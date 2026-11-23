import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFarmer } from '../../context/FarmerContext';
import { Colors } from '../../constants/theme';
import { Header } from '../../components/common/Header';

type NotifFilter = 'all' | 'offer' | 'enquiry' | 'listing' | 'system';

export default function FarmerNotificationsScreen() {
  const router = useRouter();
  const { notifications, markNotificationAsRead, refreshData } = useFarmer();
  const [filter, setFilter] = useState<NotifFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const handleNotificationPress = async (notif: typeof notifications[0]) => {
    await markNotificationAsRead(notif.id);

    if (notif.targetId) {
      if (notif.type === 'offer') {
        router.push(`/farmer/compare-offers/${notif.targetId}` as any);
      } else {
        router.push(`/farmer/crop/${notif.targetId}` as any);
      }
    }
  };

  const handleMarkAllRead = async () => {
    for (const notif of notifications) {
      if (!notif.read) {
        await markNotificationAsRead(notif.id);
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'offer':
        return { name: 'chatbubbles', color: Colors.orangeDark, bg: '#FEF4E8' };
      case 'enquiry':
        return { name: 'mail', color: Colors.secondary, bg: '#EAF6F0' };
      case 'listing':
        return { name: 'leaf', color: Colors.primary, bg: '#E2EBE5' };
      default:
        return { name: 'megaphone', color: Colors.info, bg: '#EBF3FB' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Notifications & Alerts"
        subtitle="Buyer bids, rescue inquiries and wholesale announcements"
        rightElement={
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllBtnText}>Read All</Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Chips */}
      <View style={styles.filterBar}>
        {(['all', 'offer', 'enquiry', 'listing', 'system'] as const).map(f => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map(notif => {
            const iconConfig = getIconForType(notif.type);
            return (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                onPress={() => handleNotificationPress(notif)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
                  <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
                </View>

                <View style={styles.notifContent}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>
                      {notif.title}
                    </Text>
                    {!notif.read && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.notifMessage}>{notif.message}</Text>
                  <Text style={styles.notifTime}>{notif.timestamp}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up with buyer alerts.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F0F5F2',
  },
  markAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: '#FAFCF9',
    borderColor: '#C2E5D4',
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: '900',
    color: Colors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  notifTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
