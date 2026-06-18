import React from 'react';
import { Moon, Sun, Shield, Bell } from 'lucide-react';
import { PageHeader } from '../../components/shared/UIComponents';
import useThemeStore from '../../store/themeStore';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useThemeStore();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account preferences" />
      <div className="max-w-2xl space-y-4">
        <div className="card">
          <h3 className="section-title mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} className="text-slate-400" /> : <Sun size={20} className="text-amber-500" />}
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Dark Mode</p>
                <p className="text-xs text-text-muted">Switch between light and dark theme</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-primary-500' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        <div className="card">
          <h3 className="section-title mb-4">Security</h3>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <Shield size={18} className="text-secondary-500" />
              <span>Session auto-expires after 30 minutes of inactivity</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <Bell size={18} className="text-primary-500" />
              <span>Email notifications are managed through Firebase Auth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
