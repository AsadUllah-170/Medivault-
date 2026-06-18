import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Pill, FlaskConical, Calendar, Shield,
  Upload, Plus, Activity, TrendingUp, Clock
} from 'lucide-react';
import { StatCard, PageHeader } from '../../components/shared/UIComponents';
import { SkeletonStats, SkeletonList } from '../../components/shared/SkeletonLoaders';
import useAuthStore from '../../store/authStore';
import { getPatientRecords } from '../../services/recordService';
import { getPatientAppointments } from '../../services/appointmentService';
import { getPatientPrescriptions } from '../../services/medicalService';
import { format, parseISO, isAfter } from 'date-fns';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PatientDashboard = () => {
  const { user, profile } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      try {
        const [records, appts, prescriptions] = await Promise.all([
          getPatientRecords(user.uid),
          getPatientAppointments(user.uid),
          getPatientPrescriptions(user.uid),
        ]);
        const today = new Date().toISOString().split('T')[0];
        const upcoming = appts.filter(a => a.date >= today && (a.status === 'confirmed' || a.status === 'pending'));
        const active = prescriptions.filter(p => p.status === 'active');
        setStats({
          totalRecords: records.length,
          upcomingAppts: upcoming.length,
          activeMeds: active.length,
          totalPrescriptions: prescriptions.length,
        });
        setAppointments(upcoming.slice(0, 3));
        setRecentRecords(records.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <PageHeader title={`${greeting}, ${profile?.name?.split(' ')[0] || 'Patient'} 👋`} subtitle="Here's your health summary for today" />

      {loading ? (
        <SkeletonStats count={4} />
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div variants={item}><StatCard icon={FileText} label="Total Records" value={stats?.totalRecords || 0} color="blue" /></motion.div>
          <motion.div variants={item}><StatCard icon={Calendar} label="Upcoming Appts" value={stats?.upcomingAppts || 0} color="green" /></motion.div>
          <motion.div variants={item}><StatCard icon={Pill} label="Active Medications" value={stats?.activeMeds || 0} color="purple" /></motion.div>
          <motion.div variants={item}><StatCard icon={FileText} label="Prescriptions" value={stats?.totalPrescriptions || 0} color="amber" /></motion.div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { icon: Calendar, label: 'Book Appointment', to: '/patient/appointments', color: 'text-primary-600 bg-primary-50' },
              { icon: Upload, label: 'Upload Document', to: '/patient/lab-reports', color: 'text-secondary-600 bg-secondary-50' },
              { icon: Shield, label: 'View Emergency Card', to: '/patient/emergency', color: 'text-red-600 bg-red-50' },
              { icon: Plus, label: 'Add Medical Record', to: '/patient/records', color: 'text-purple-600 bg-purple-50' },
            ].map((action) => (
              <Link key={action.label} to={action.to} className="card flex items-center gap-4 hover:shadow-md transition-all p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon size={20} />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="text-sm text-primary-600 font-medium hover:underline">View all</Link>
          </div>
          {loading ? (
            <SkeletonList count={3} />
          ) : appointments.length === 0 ? (
            <div className="card text-center py-10">
              <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No upcoming appointments</p>
              <Link to="/patient/appointments" className="btn-primary mt-4 mx-auto w-fit">Book Appointment</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="card flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate">{appt.reason || 'General Consultation'}</p>
                    <p className="text-xs text-text-muted mt-0.5">{appt.date} • {appt.timeSlot}</p>
                  </div>
                  <span className={`badge ${appt.status === 'confirmed' ? 'badge-green' : 'badge-amber'} capitalize`}>{appt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Records */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Medical Records</h2>
          <Link to="/patient/records" className="text-sm text-primary-600 font-medium hover:underline">View all</Link>
        </div>
        {loading ? (
          <SkeletonList count={4} />
        ) : recentRecords.length === 0 ? (
          <div className="card text-center py-10">
            <FileText size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No medical records yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {recentRecords.map((rec) => (
              <div key={rec.id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-primary-500" />
                    <span className="badge-blue capitalize">{rec.type || 'general'}</span>
                  </div>
                  <span className="text-xs text-text-muted font-mono">
                    {rec.date || (rec.createdAt?.toDate ? format(rec.createdAt.toDate(), 'MMM dd, yyyy') : '—')}
                  </span>
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{rec.title || 'Medical Record'}</p>
                <p className="text-xs text-text-muted mt-1">{rec.content?.diagnosis || rec.content?.notes || 'No details'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
