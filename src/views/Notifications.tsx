'use client';

import { Bell, AlertCircle, AlertTriangle, CheckCircle, Info, Trash2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useNotifications, NotifType, AppNotification } from '../context/NotificationContext';

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifIcon({ type }: { type: NotifType }) {
  if (type === 'error') return <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />;
  if (type === 'warning') return <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />;
  if (type === 'success') return <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />;
  return <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />;
}

const borderColor: Record<NotifType, string> = {
  error: 'border-red-200 bg-red-50/50',
  warning: 'border-orange-200 bg-orange-50/50',
  success: 'border-green-200 bg-green-50/30',
  info: 'border-[#eaeaE0]',
};

export default function Notifications() {
  const { notifications, unreadCount, markAllRead, markRead, dismiss, refresh } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight flex items-center gap-2">
            <Bell size={22} className="text-[#5A5A40]" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h2>
          <p className="text-sm text-[#9e9e9e]">Expiry alerts from your pantry & fridge</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="p-2 text-[#9e9e9e] hover:text-[#5A5A40] hover:bg-[#f0f0eb] rounded-xl transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-bold text-[#5A5A40] hover:underline">
              Mark all read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[28px] border border-[#eaeaE0]">
          <Bell size={44} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-[#4a4a3a]">You're all caught up!</p>
          <p className="text-sm text-[#9e9e9e] mt-1">No expiring items in your pantry or fridge</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {notifications.map(n => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                {n.link ? (
                  <Link href={n.link} onClick={() => markRead(n.id)}>
                    <NotifCard n={n} onDismiss={dismiss} />
                  </Link>
                ) : (
                  <NotifCard n={n} onDismiss={dismiss} onClick={() => markRead(n.id)} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function NotifCard({ n, onDismiss, onClick }: { n: AppNotification; onDismiss: (id: string) => void; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[20px] border p-4 flex items-start gap-3 shadow-sm cursor-pointer transition-all hover:shadow-md ${
        n.read ? 'border-[#eaeaE0]' : borderColor[n.type as NotifType]
      }`}
    >
      <NotifIcon type={n.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-sm font-bold ${n.read ? 'text-[#4a4a3a]' : 'text-[#1a1a1a]'}`}>{n.title}</p>
          {!n.read && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
        </div>
        <p className="text-xs text-[#9e9e9e] leading-relaxed">{n.body}</p>
        <p className="text-[10px] text-[#c0c0b0] mt-1.5 font-medium">{timeAgo(n.time)}</p>
      </div>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onDismiss(n.id); }}
        className="p-1.5 text-[#c0c0b0] hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
