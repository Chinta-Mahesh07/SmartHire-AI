import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAllRead, markSingleRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markSingleRead(notif.id)}
                  className={`p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex gap-3 ${
                    !notif.is_read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
