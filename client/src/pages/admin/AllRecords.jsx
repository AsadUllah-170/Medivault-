import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText } from 'lucide-react';
import { PageHeader, StatusBadge, EmptyState } from '../../components/shared/UIComponents';
import { SkeletonTable } from '../../components/shared/SkeletonLoaders';
import { getAllRecords } from '../../services/recordService';

const AllRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    getAllRecords().then(setRecords).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = records.filter(r => {
    const matchSearch = !search || r.patientId?.includes(search) || r.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || r.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div>
      <PageHeader title="All Medical Records" subtitle="System-wide view of all uploaded records" />

      <div className="card mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient ID or title..." className="input-field pl-9" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field sm:w-48">
          <option value="All">All Types</option>
          <option value="diagnosis">Diagnosis</option>
          <option value="lab">Lab Report</option>
          <option value="imaging">Imaging</option>
          <option value="prescription">Prescription</option>
          <option value="general">General</option>
        </select>
      </div>

      {loading ? <SkeletonTable rows={8} /> : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No records found" />
      ) : (
        <div className="card overflow-hidden p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Patient ID</th>
                <th className="px-6 py-4 font-semibold">Doctor ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-700">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{r.title || 'Medical Record'}</td>
                  <td className="px-6 py-4"><span className="badge-blue capitalize">{r.type || 'general'}</span></td>
                  <td className="px-6 py-4 font-mono text-slate-500">{r.date || '—'}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.patientId?.slice(0,8)}...</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.doctorId?.slice(0,8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllRecords;
