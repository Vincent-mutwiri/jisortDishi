'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../lib/api';

export type NotifType = 'warning' | 'error' | 'info' | 'success';

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  markRead: () => {},
  dismiss: () => {},
  refresh: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildNotifications(pantryItems: any[]): AppNotification[] {
  const notifs: AppNotification[] = [];
  const now = Date.now();

  for (const item of pantryItems) {
    if (!item.expiry_date) continue;
    const expiry = new Date(item.expiry_date).getTime();
    const diffDays = Math.ceil((expiry - now) / 86400000);
    const storage = item.storage_type === 'fridge' ? 'fridge' : 'pantry';
    const link = `/${storage}`;

    if (diffDays < 0) {
      notifs.push({
        id: `expired-${item.item_id}`,
        type: 'error',
        title: `${item.item_name} has expired`,
        body: `${item.item_name} in your ${storage} expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago. Consider removing it.`,
        time: new Date(expiry),
        read: false,
        link,
      });
    } else if (diffDays === 0) {
      notifs.push({
        id: `expiring-today-${item.item_id}`,
        type: 'warning',
        title: `${item.item_name} expires today`,
        body: `Use your ${item.item_name} today before it goes bad.`,
        time: new Date(),
        read: false,
        link,
      });
    } else if (diffDays <= 2) {
      notifs.push({
        id: `expiring-soon-${item.item_id}`,
        type: 'warning',
        title: `${item.item_name} expiring soon`,
        body: `${item.item_name} in your ${storage} expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}. Plan a meal to use it up.`,
        time: new Date(),
        read: false,
        link,
      });
    } else if (diffDays <= 5) {
      notifs.push({
        id: `expiring-this-week-${item.item_id}`,
        type: 'info',
        title: `${item.item_name} — ${diffDays} days left`,
        body: `${item.item_name} expires in ${diffDays} days. Consider using it in a recipe soon.`,
        time: new Date(),
        read: true,
        link,
      });
    }
  }

  // Sort: errors first, then warnings, then info; unread before read
  return notifs.sort((a, b) => {
    const priority = { error: 0, warning: 1, info: 2, success: 3 };
    if (a.read !== b.read) return a.read ? 1 : -1;
    return priority[a.type] - priority[b.type];
  });
}

// Persist read/dismissed state in localStorage
const STORAGE_KEY = 'jisort_notif_state';

function loadState(): { read: string[]; dismissed: string[] } {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"read":[],"dismissed":[]}');
  } catch {
    return { read: [], dismissed: [] };
  }
}

function saveState(state: { read: string[]; dismissed: string[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(async () => {
    try {
      const pantry = await api.getPantry();
      const built = buildNotifications(pantry);
      const { read, dismissed } = loadState();

      const merged = built
        .filter(n => !dismissed.includes(n.id))
        .map(n => ({ ...n, read: read.includes(n.id) ? true : n.read }));

      setNotifications(merged);
    } catch {
      // silently fail — notifications are non-critical
    }
  }, []);

  useEffect(() => {
    refresh();
    // Re-check every 5 minutes
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      const { dismissed } = loadState();
      saveState({ read: updated.map(n => n.id), dismissed });
      return updated;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      const { dismissed } = loadState();
      saveState({ read: updated.filter(n => n.read).map(n => n.id), dismissed });
      return updated;
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      const { read } = loadState();
      const { dismissed } = loadState();
      saveState({ read, dismissed: [...dismissed, id] });
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, dismiss, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}
