import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Calendar, FileText, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { StatCard, PageHeader } from '../../components/shared/UIComponents';
import { SkeletonStats } from '../../components/shared/SkeletonLoaders';
import { getAdminStats, getAllPatients, getAllDoctorsAdmin } from '../../services/adminService';
import { getAllAppointments } from '../../services/appointmentService';
import { getAllRecords } from '../../services/recordService';
import { format, subDays } from 'date-fns';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [recordTypes, setRecordTypes] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, appointments, records, patients] = await Promise.all([
          getAdminStats(),
          getAllAppointments(),
          getAllRecords(),
          getAllPatients(),
        ]);
        setStats(s);

        // Last 7 days appointment chart data
        const last7 = Array.from({ length: 7 }, (_, i) => {
          const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
          const label = format(subDays(new Date(), 6 - i), 'MMM d');
          const count = appointments.filter(a => a.date === date).length;
          return { date: label, appointments: count };
        });
        setChartData(last7);

        // Record types pie chart
        const typeCounts = records.reduce((acc, r) => {
          const t = r.type || 'general';
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {});
        setRecordTypes(Object.entries(typeCounts).map(([name, value]) => ({ name, value })));

        setRecentPatients(patients.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader title="Admin Overview" subtitle="System-wide statistics and activity" />

      {loading ? (
        <SkeletonStats count={4} />
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div variants={item}><StatCard icon={Users} label="Total Patients" value={stats?.totalPatients || 0} color="blue" /></motion.div>
          <motion.div variants={item}><StatCard icon={UserCheck} label="Total Doctors" value={stats?.totalDoctors || 0} color="green" /></motion.div>
          <motion.div variants={item}><StatCard icon={Calendar} label="Total Appointments" value={stats?.totalAppointments || 0} color="purple" /></motion.div>
          <motion.div variants={item}><StatCard icon={FileText} label="Total Records" value={stats?.totalRecords || 0} color="amber" /></motion.div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Appointment Trend */}
        <div className="card lg:col-span-2">
          <h3 className="section-title mb-4">Appointments (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="appointments" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Record Types */}
        <div className="card">
          <h3 className="section-title mb-4">Records by Type</h3>
          {recordTypes.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={recordTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {recordTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {recordTypes.map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="capitalize text-slate-600 dark:text-slate-400">{t.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{t.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">No records yet</p>
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card">
        <h3 className="section-title mb-4">Recent Patient Registrations</h3>
        {recentPatients.length === 0 ? (
          <p className="text-slate-400 text-sm">No patients registered yet.</p>
        ) : (
          <div className="space-y-3">
            {recentPatients.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-sm">
                  {p.personalInfo?.name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{p.personalInfo?.name || 'Unknown'}</p>
                  <p className="text-xs text-text-muted">{p.email}</p>
                </div>
                <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'} capitalize`}>{p.status || 'active'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
