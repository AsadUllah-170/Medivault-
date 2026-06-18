import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/UIComponents';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getAllPatients, getAllDoctors } from '../../services/adminService';
import { getAllAppointments } from '../../services/appointmentService';
import { format, subDays } from 'date-fns';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ regTrend: [], apptTrend: [] });

  useEffect(() => {
    Promise.all([getAllPatients(), getAllAppointments(), getAllDoctors()]).then(([patients, appts, docs]) => {
      // 30 days registration trend
      const regMap = {};
      patients.forEach(p => {
        if(p.createdAt?.toDate) {
          const d = format(p.createdAt.toDate(), 'yyyy-MM-dd');
          regMap[d] = (regMap[d] || 0) + 1;
        }
      });
      const regTrend = Array.from({length: 30}, (_, i) => {
        const dateStr = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
        return { date: format(subDays(new Date(), 29 - i), 'MMM d'), patients: regMap[dateStr] || 0 };
      });

      // Appointments status trend
      const apptMap = {};
      appts.forEach(a => {
        if (!apptMap[a.date]) apptMap[a.date] = { date: a.date, completed: 0, cancelled: 0, other: 0 };
        if (a.status === 'completed') apptMap[a.date].completed++;
        else if (a.status === 'cancelled') apptMap[a.date].cancelled++;
        else apptMap[a.date].other++;
      });
      const apptTrend = Object.values(apptMap).sort((a,b) => a.date.localeCompare(b.date)).slice(-15).map(x => ({ ...x, date: format(new Date(x.date), 'MMM d')}));

      setData({ regTrend, apptTrend });
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Deep dive into system metrics and growth" />
      {loading ? <div className="card h-96 animate-pulse" /> : (
        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title mb-4">Patient Registrations (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.regTrend}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="patients" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPatients)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="section-title mb-4">Appointment Outcomes (Recent)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.apptTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="other" stackId="a" fill="#38bdf8" />
                <Bar dataKey="cancelled" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
