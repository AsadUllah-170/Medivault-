import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, FileText, Pill, Clock, Plus, Activity } from 'lucide-react';
import { StatCard, PageHeader } from '../../components/shared/UIComponents';
import { SkeletonStats, SkeletonList } from '../../components/shared/SkeletonLoaders';
import useAuthStore from '../../store/authStore';
import { getDoctorAppointments } from '../../services/appointmentService';
import { getAllPatients } from '../../services/adminService';
import { format } from 'date-fns';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const DoctorDashboard = () => {
  const { user, profile } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([getDoctorAppointments(user.uid), getAllPatients()])
      .then(([appts, patients]) => {
        setAppointments(appts);
        setPatientCount(patients.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const upcoming = appointments.filter(a => a.date >= today && a.status !== 'cancelled').slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <PageHeader title={`${greeting}, Dr. ${profile?.name?.split(' ')[0] || 'Doctor'} 👋`} subtitle="Your clinical overview for today" />

      {loading ? (
        <SkeletonStats count={4} />
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div variants={item}><StatCard icon={Calendar} label="Today's Appointments" value={todayAppts.length} color="blue" /></motion.div>
          <motion.div variants={item}><StatCard icon={Users} label="Total Patients" value={patientCount} color="green" /></motion.div>
          <motion.div variants={item}><StatCard icon={FileText} label="Total Appointments" value={appointments.length} color="purple" /></motion.div>
          <motion.div variants={item}><StatCard icon={Activity} label="Pending Requests" value={appointments.filter(a => a.status === 'pending').length} color="amber" /></motion.div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { icon: Pill, label: 'Write Prescription', to: '/doctor/prescriptions/new', color: 'text-purple-600 bg-purple-50' },
              { icon: FileText, label: 'Add Diagnosis', to: '/doctor/diagnosis/new', color: 'text-primary-600 bg-primary-50' },
              { icon: Plus, label: 'Upload Report', to: '/doctor/reports/upload', color: 'text-secondary-600 bg-secondary-50' },
              { icon: Calendar, label: 'Manage Schedule', to: '/doctor/schedule', color: 'text-amber-600 bg-amber-50' },
            ].map(action => (
              <Link key={action.label} to={action.to} className="card flex items-center gap-4 hover:shadow-md transition-all p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Timeline */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Today's Appointments</h2>
            <Link to="/doctor/appointments" className="text-sm text-primary-600 font-medium hover:underline">View all</Link>
          </div>
          {loading ? <SkeletonList count={3} /> : (
            todayAppts.length === 0 ? (
              <div className="card text-center py-10">
                <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppts.map(appt => (
                  <div key={appt.id} className="card flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{appt.reason || 'General Consultation'}</p>
                      <p className="text-xs text-text-muted">{appt.timeSlot} • Patient ID: <span className="font-mono">{appt.patientId?.slice(0, 8)}...</span></p>
                    </div>
                    <span className={`badge capitalize ${appt.status === 'confirmed' ? 'badge-green' : appt.status === 'pending' ? 'badge-amber' : 'badge-gray'}`}>{appt.status}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
