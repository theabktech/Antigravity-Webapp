import { triggerHaptic } from './haptics';

declare global {
  interface Window {
    AndroidNotifications?: {
      sendNotification: (title: string, body: string) => void;
    };
  }
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  if (window.AndroidNotifications?.sendNotification) {
    return true;
  }

  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  }

  return false;
};

export const dispatchNotification = (title: string, body: string): void => {
  if (typeof window === 'undefined') return;

  // 1. Android Native Notification Bridge
  if (window.AndroidNotifications?.sendNotification) {
    try {
      window.AndroidNotifications.sendNotification(title, body);
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  // 2. Web Notification API (PWA / Browser)
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png'
          });
        }).catch(() => {
          new Notification(title, { body, icon: '/icon-192.png' });
        });
      } else {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
    } catch (e) {
      console.warn('Web notification failed:', e);
    }
  }

  // 3. Haptic vibration
  try {
    triggerHaptic('success', true);
  } catch (e) {}
};
