import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import api from '../services/api';

export default function NotificationBell({ userId }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?size=8');
      setNotifications(res.data.content || []);
      const countRes = await api.get('/notifications/unread-count');
      setUnreadCount(countRes.data.unreadCount || 0);
    } catch (err) {
      console.warn('Could not fetch notifications:', err.message);
    }
  };

  useEffect(() => {
    // Initial fetch on mount or user change
    fetchNotifications();

    // Periodic background sync every 30 minutes (1,800,000 ms)
    const intervalId = setInterval(fetchNotifications, 30 * 60 * 1000);

    // Refresh instantly when the user focuses the window or switches back to this app tab
    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="notification-trigger relative p-2 text-secondary hover:text-ink hover:bg-inset rounded-control"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold text-ink bg-danger rounded-chip px-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel absolute right-0 mt-2 bg-panel rounded-card border border-rule z-50 overflow-hidden" role="region" aria-label="Notifications">
          <div className="flex items-center justify-between px-4 py-3 bg-inset border-b border-rule">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-ink text-sm">Notifications</span>
              <span className="bg-success-soft text-success text-xs px-2 py-0.5 rounded-chip font-medium">
                Live
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-instrument hover:text-instrument font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-rule">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && !n.isRead) { event.preventDefault(); handleMarkAsRead(n.id); } }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.isRead ? 'Read' : 'Unread'} notification: ${n.title}`}
                  className={`p-3.5 hover:bg-inset  cursor-pointer ${
                    !n.isRead ? 'bg-instrument-soft' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-semibold text-ink">{n.title}</span>
                    <span className="text-xs text-muted whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-1 line-clamp-2">{n.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-inset border-t border-rule text-center">
            <span className="text-xs text-muted">
              Live updates active &bull; Syncs with campus database
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
