import React, { useState } from 'react';
import { Menu, Search, Bell, Moon, Sun, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import useNotificationStore from '../../store/notificationStore';
import useAuthStore from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';

const Header = ({ onMenuClick }) => {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { notifications, unreadCount, markRead } = useNotificationStore();
  const { profile } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MV';

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-border dark:border-slate-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search records, doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-border dark:border-slate-700 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-primary-600 font-medium">{unreadCount} unread</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`px-4 py-3 border-b border-border dark:border-slate-700 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          !n.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{n.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                        {n.createdAt && (
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDistanceToNow(n.createdAt.toDate?.() || new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border dark:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none">{profile?.name || 'User'}</p>
            <p className="text-xs text-text-muted capitalize">{profile?.role || 'user'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
