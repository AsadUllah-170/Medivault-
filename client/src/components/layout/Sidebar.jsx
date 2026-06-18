import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, FileText, Pill, FlaskConical, Scan,
  Calendar, Shield, Settings, LogOut, X, Activity, Heart
} from 'lucide-react';
import { logoutUser } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const patientLinks = [
  { to: '/patient', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patient/profile', label: 'My Profile', icon: User },
  { to: '/patient/records', label: 'Medical Records', icon: FileText },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
  { to: '/patient/lab-reports', label: 'Lab Reports', icon: FlaskConical },
  { to: '/patient/imaging', label: 'X-Rays & Imaging', icon: Scan },
  { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { to: '/patient/emergency', label: 'Emergency Card', icon: Shield },
  { to: '/patient/settings', label: 'Settings', icon: Settings },
];

const doctorLinks = [
  { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/doctor/patients', label: 'My Patients', icon: User },
  { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
  { to: '/doctor/prescriptions/new', label: 'Write Prescription', icon: Pill },
  { to: '/doctor/diagnosis/new', label: 'Add Diagnosis', icon: Activity },
  { to: '/doctor/reports/upload', label: 'Upload Reports', icon: FileText },
  { to: '/doctor/schedule', label: 'Schedule', icon: Calendar },
  { to: '/doctor/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/doctors', label: 'Manage Doctors', icon: User },
  { to: '/admin/patients', label: 'Manage Patients', icon: User },
  { to: '/admin/records', label: 'All Records', icon: FileText },
  { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { to: '/admin/analytics', label: 'Analytics', icon: Activity },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const roleLinksMap = { patient: patientLinks, doctor: doctorLinks, admin: adminLinks };

const Sidebar = ({ role, mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const links = roleLinksMap[role] || patientLinks;

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border dark:border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
          <Heart size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 dark:text-white text-lg leading-none">MediVault</h1>
          <p className="text-xs text-text-muted capitalize">{role} Portal</p>
        </div>
        {mobileOpen && (
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600 lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto sidebar-scroll">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active font-semibold' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border dark:border-slate-700">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-border dark:border-slate-700 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 z-50 lg:hidden flex flex-col border-r border-border dark:border-slate-700"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
