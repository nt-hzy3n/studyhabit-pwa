import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

class NotificationService {
  private isInitialized = false;
  private pushToken: string | null = null;

  /**
   * Initializes push & local notification channels and permissions
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (Capacitor.isNativePlatform()) {
      try {
        // 1. Local Notifications setup
        const localPerm = await LocalNotifications.checkPermissions();
        if (localPerm.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }

        // Create default channel on Android
        await LocalNotifications.createChannel({
          id: 'sync_channel',
          name: 'Đồng bộ Khảo sát (Field Survey Sync)',
          description: 'Thông báo kết quả đồng bộ dữ liệu ngoại tuyến',
          importance: 4, // High
          visibility: 1,
          vibration: true,
        });

        // 2. Push Notifications setup
        if (Capacitor.isPluginAvailable('PushNotifications')) {
          try {
            const pushPerm = await PushNotifications.checkPermissions();
            if (pushPerm.receive !== 'granted') {
              await PushNotifications.requestPermissions();
            }

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
              console.log('[NotificationService] Push notification received in foreground:', notification);
            });
          } catch (pushErr) {
            console.warn('[NotificationService] Push notifications setup warning (no FCM google-services.json):', pushErr);
          }
        }
      } catch (err) {
        console.warn('[NotificationService] Native notifications init warning:', err);
      }
    } else {
      // Web notification request if supported
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
          } catch (e) {
            console.warn('Web notification request error:', e);
          }
        }
      }
    }
  }

  /**
   * Sends sync-success alert notification when offline responses are uploaded to server (Slide 12: Item 4)
   */
  public async sendSyncSuccessAlert(count: number, details?: string): Promise<void> {
    const title = 'Đồng bộ dữ liệu thành công! ✅';
    const body =
      details ||
      (count === 1
        ? 'Đã đồng bộ 01 phiếu khảo sát ngoại tuyến lên máy chủ Google Sheets.'
        : `Đã đồng bộ toàn bộ ${count} phiếu khảo sát ngoại tuyến lên máy chủ Google Sheets.`);

    if (Capacitor.isNativePlatform()) {
      try {
        const notifId = Math.floor(Math.random() * 1000000) + 1;
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: notifId,
              channelId: 'sync_channel',
              schedule: { at: new Date(Date.now() + 200) },
              sound: 'beep.wav',
            },
          ],
        });
        return;
      } catch (err) {
        console.warn('[NotificationService] LocalNotifications schedule failed:', err);
      }
    }

    // Web Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
        });
      } catch (e) {
        console.warn('[NotificationService] Web notification fallback error:', e);
      }
    }
  }

  public getPushToken(): string | null {
    return this.pushToken;
  }
}

export const notificationService = new NotificationService();
