import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { useEffect } from 'react';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import SessionWarningModal from '../shared/SessionWarningModal';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, user } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const { showWarning, dismissWarning } = useSessionTimeout();

  useEffect(() => {
    if (user?.uid) {
      fetchNotifications(user.uid);
    }
  }, [user?.uid]);

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-slate-900">
      <Sidebar
        role={profile?.role || 'patient'}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      {showWarning && <SessionWarningModal onDismiss={dismissWarning} />}
    </div>
  );
};

export default DashboardLayout;
