import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { PageHeader, StatusBadge, EmptyState, Modal } from '../../components/shared/UIComponents';
import { SkeletonList } from '../../components/shared/SkeletonLoaders';
import { getAllDoctorsAdmin, updateDoctorStatus } from '../../services/adminService';
import toast from 'react-hot-toast';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAllDoctorsAdmin().then(setDoctors).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateDoctorStatus(id, status);
      setDoctors(d => d.map(doc => doc.id === id ? { ...doc, status } : doc));
      toast.success(`Doctor ${status} successfully!`);
    } catch { toast.error('Action failed.'); }
  };

  const filtered = doctors.filter(d =>
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Manage Doctors" subtitle="Review, approve, and manage doctor accounts" />

      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or specialization..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No doctors found" />
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <div key={doc.id} className="card flex flex-col sm:flex-row sm:items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold shrink-0">
                {doc.name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-700 dark:text-slate-200">Dr. {doc.name}</p>
                <div className="flex gap-3 text-xs text-text-muted mt-0.5">
                  <span>{doc.specialization}</span>
                  <span className="font-mono">{doc.licenseNumber}</span>
                </div>
                <p className="text-xs text-text-muted">{doc.hospitalAffiliation}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={doc.status || 'pending'} />
                <button onClick={() => setSelected(doc)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                  <Eye size={16} />
                </button>
                {doc.status === 'pending' && (
                  <button onClick={() => handleStatus(doc.id, 'approved')} className="p-1.5 rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100">
                    <CheckCircle size={16} />
                  </button>
                )}
                {doc.status !== 'suspended' && (
                  <button onClick={() => handleStatus(doc.id, 'suspended')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                    <XCircle size={16} />
                  </button>
                )}
                {doc.status === 'suspended' && (
                  <button onClick={() => handleStatus(doc.id, 'approved')} className="p-1.5 rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100">
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Doctor Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold">{selected.name?.charAt(0)}</div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dr. {selected.name}</h3>
                <p className="text-text-muted">{selected.specialization}</p>
                <StatusBadge status={selected.status || 'pending'} />
              </div>
            </div>
            {[
              ['Email', selected.email],
              ['License Number', selected.licenseNumber],
              ['Hospital', selected.hospitalAffiliation],
              ['Status', selected.status],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-border dark:border-slate-700 text-sm">
                <span className="text-text-muted">{label}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">{val || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageDoctors;
