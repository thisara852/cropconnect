import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Platform } from 'react-native';

const STORAGE_KEY_NOTIF_PREF = '@cropconnect_notif_enabled';
const STORAGE_KEY_NOTIF_HISTORY = '@cropconnect_inapp_notifications';

export type NotificationEventType =
  | 'new_offer'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'buyer_verified'
  | 'price_alert'
  | 'admin_announcement';

export interface AppNotification {
  id: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  routeTarget?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private inAppNotifications: AppNotification[] = [];
  private isPermissionGranted = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return; // Skip SSR execution in Node.js
    }
    try {
      const pref = await AsyncStorage.getItem(STORAGE_KEY_NOTIF_PREF);
      this.isPermissionGranted = pref === 'true';

      const stored = await AsyncStorage.getItem(STORAGE_KEY_NOTIF_HISTORY);
      if (stored) {
        this.inAppNotifications = JSON.parse(stored);
      }
    } catch {}
  }

  async requestNotificationPermission(): Promise<boolean> {
    this.isPermissionGranted = true;
    await AsyncStorage.setItem(STORAGE_KEY_NOTIF_PREF, 'true');
    return true;
  }

  hasPermission(): boolean {
    return this.isPermissionGranted;
  }

  async dispatchNotification(
    eventType: NotificationEventType,
    title: string,
    message: string,
    routeTarget?: string,
    metadata?: Record<string, any>
  ): Promise<AppNotification> {
    const notif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      eventType,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      routeTarget,
      metadata,
    };

    this.inAppNotifications.unshift(notif);
    if (this.inAppNotifications.length > 50) this.inAppNotifications.pop();

    try {
      await AsyncStorage.setItem(STORAGE_KEY_NOTIF_HISTORY, JSON.stringify(this.inAppNotifications));
    } catch {}

    return notif;
  }

  getNotificationHistory(): AppNotification[] {
    return [...this.inAppNotifications];
  }

  async markAsRead(id: string): Promise<void> {
    const notif = this.inAppNotifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      await AsyncStorage.setItem(STORAGE_KEY_NOTIF_HISTORY, JSON.stringify(this.inAppNotifications));
    }
  }

  handleNotificationTap(notification: AppNotification): void {
    this.markAsRead(notification.id);
    if (notification.routeTarget) {
      try {
        router.push(notification.routeTarget as any);
      } catch (e) {
        console.warn('Failed to route notification:', e);
      }
    }
  }
}

export const notificationService = new NotificationService();
