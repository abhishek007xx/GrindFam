import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCircle2, Flame, Trophy, Zap, AlertCircle, Check, Trash2, X, ChevronRight, UserPlus
} from 'lucide-react';

const STORAGE_KEY_NOTIFS = 'grindfam_user_notifications';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: '🎯 Daily Target Completed!',
    message: 'You have smashed your daily 5-problem target today. Great consistency!',
    timestamp: '2 hours ago',
    type: 'success',
    read: false,
    link: '/dashboard'
  },
  {
    id: 'notif-2',
    title: '🔥 5-Day Streak Active!',
    message: 'You are on a 5-day continuous streak. Keep it going to level up!',
    timestamp: '5 hours ago',
    type: 'streak',
    read: false,
    link: '/dashboard'
  },
  {
    id: 'notif-3',
    title: '🏆 Worldwide Leaderboard Rank Up',
    message: 'You climbed 2 spots on the Global Leaderboard today!',
    timestamp: '1 day ago',
    type: 'trophy',
    read: true,
    link: '/leaderboard'
  },
  {
    id: 'notif-4',
    title: '⚡ Squad Salute Received',
    message: 'Alex Chen saluted your recent LeetCode submission!',
    timestamp: '2 days ago',
    type: 'salute',
    read: true,
    link: '/community'
  }
];

export default function NotificationsDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleDeleteNotif = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id);
    onClose();
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const filteredNotifs = notifications.filter(n => filter === 'all' || !n.read);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 py-2 text-white dark:text-white light:text-slate-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-slate-200">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#EA5D3A]" />
          <h3 className="text-xs font-bold text-white dark:text-white light:text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#EA5D3A] text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[#EA5D3A] hover:underline font-semibold"
            >
              Read All
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-zinc-500 hover:text-rose-400 transition-colors"
              title="Clear all notifications"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-[#141414]/50 dark:bg-[#141414]/50 light:bg-slate-100/50 border-b border-[#2C2C2C] text-[10px]">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#EA5D3A] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-[#EA5D3A] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#2C2C2C]/50">
        {filteredNotifs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            {filter === 'unread' ? 'No unread notifications 🎉' : 'No notifications yet'}
          </div>
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3 cursor-pointer flex items-start justify-between gap-3 transition-colors ${
                item.read
                  ? 'bg-transparent hover:bg-white/5 opacity-70'
                  : 'bg-[#EA5D3A]/[0.06] hover:bg-[#EA5D3A]/[0.12] font-semibold'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 flex-shrink-0">
                  {item.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : item.type === 'streak' ? (
                    <Flame className="w-4 h-4 text-amber-400" />
                  ) : item.type === 'trophy' ? (
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Zap className="w-4 h-4 text-[#EA5D3A]" />
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate leading-tight">{item.title}</p>
                    {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-[#EA5D3A] flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-zinc-300 dark:text-zinc-300 light:text-slate-600 line-clamp-2 leading-relaxed">{item.message}</p>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">{item.timestamp}</p>
                </div>
              </div>

              <button
                onClick={(e) => handleDeleteNotif(item.id, e)}
                className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                title="Delete notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#2C2C2C] text-center text-[10px] text-zinc-500">
        Click any notification to open relevant section
      </div>
    </motion.div>
  );
}
