import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import { LoadingSpinner } from './components/shared/UIComponents';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth
import Landing from './pages/auth/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import MedicalRecords from './pages/patient/MedicalRecords';
import Prescriptions from './pages/patient/Prescriptions';
import LabReports from './pages/patient/LabReports';
import Imaging from './pages/patient/Imaging';
import Appointments from './pages/patient/Appointments';
import EmergencyCard from './pages/patient/EmergencyCard';
import PublicEmergency from './pages/patient/PublicEmergency';
import PatientSettings from './pages/patient/Settings';

// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import WritePrescription from './pages/doctor/WritePrescription';
import AddDiagnosis from './pages/doctor/AddDiagnosis';
import UploadReports from './pages/doctor/UploadReports';
import Schedule from './pages/doctor/Schedule';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import AllRecords from './pages/admin/AllRecords';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading, initialized } = useAuthStore();

  // Show loading spinner until Firebase auth has initialized
  if (!initialized || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Profile is still being fetched — wait a moment before redirecting
  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Wrong role → redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={`/${profile.role}`} replace />;
  }

  return children;
};

const App = () => {
  const { initTheme } = useThemeStore();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initTheme();
    const unsubscribe = initialize();
    return () => unsubscribe && unsubscribe();
  }, [initTheme, initialize]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/emergency/:patientId" element={<PublicEmergency />} />

        {/* Patient Dashboard */}
        <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<PatientDashboard />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="records" element={<MedicalRecords />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="lab-reports" element={<LabReports />} />
          <Route path="imaging" element={<Imaging />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="emergency" element={<EmergencyCard />} />
          <Route path="settings" element={<PatientSettings />} />
        </Route>

        {/* Doctor Dashboard */}
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="prescriptions/new" element={<WritePrescription />} />
          <Route path="diagnosis/new" element={<AddDiagnosis />} />
          <Route path="reports/upload" element={<UploadReports />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<ManageDoctors />} />
          <Route path="patients" element={<ManagePatients />} />
          <Route path="records" element={<AllRecords />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
