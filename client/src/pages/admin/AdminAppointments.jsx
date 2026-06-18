import React, { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { PageHeader, StatusBadge, EmptyState } from '../../components/shared/UIComponents';
import { SkeletonTable } from '../../components/shared/SkeletonLoaders';
import { getAllAppointments } from '../../services/appointmentService';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllAppointments().then(setAppointments).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = appointments.filter(a =>
    !search || a.patientId?.includes(search) || a.doctorId?.includes(search) || a.date?.includes(search)
  );

  return (
    <div>
      <PageHeader title="Appointments Overview" subtitle="System-wide view of all appointments" />

      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or date (YYYY-MM-DD)..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? <SkeletonTable rows={8} /> : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments found" />
      ) : (
        <div className="card overflow-hidden p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Patient ID</th>
                <th className="px-6 py-4 font-semibold">Doctor ID</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-700">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap"><span className="font-medium text-slate-800 dark:text-slate-200">{a.date}</span> <span className="text-text-muted ml-2">{a.timeSlot}</span></td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{a.patientId?.slice(0,8)}...</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{a.doctorId?.slice(0,8)}...</td>
                  <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{a.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
