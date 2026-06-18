import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { logoutUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const SessionWarningModal = ({ onDismiss }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutUser();
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Session Expiring Soon</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
          Your session will expire in <strong>5 minutes</strong> due to inactivity. Would you like to continue?
        </p>
        <div className="flex gap-3">
          <button onClick={handleLogout} className="btn-outline flex-1 justify-center">
            Log Out
          </button>
          <button onClick={onDismiss} className="btn-primary flex-1 justify-center">
            Stay Logged In
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SessionWarningModal;
