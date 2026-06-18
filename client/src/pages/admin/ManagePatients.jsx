import React, { useState, useEffect } from 'react';
import { Search, UserX, Eye } from 'lucide-react';
import { PageHeader, StatusBadge, EmptyState, Modal } from '../../components/shared/UIComponents';
import { SkeletonList } from '../../components/shared/SkeletonLoaders';
import { getAllPatients } from '../../services/adminService';
import toast from 'react-hot-toast';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAllPatients().then(setPatients).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDeactivate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'users', id), { disabled: newStatus === 'inactive', updatedAt: serverTimestamp() });
      setPatients(p => p.map(pt => pt.id === id ? { ...pt, status: newStatus } : pt));
      toast.success(`Patient account ${newStatus}!`);
    } catch { toast.error('Action failed.'); }
  };

  const filtered = patients.filter(p =>
    !search || p.personalInfo?.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Manage Patients" subtitle="Review and manage patient accounts" />

      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No patients found" />
      ) : (
        <div className="space-y-3">
          {filtered.map(pt => (
            <div key={pt.id} className="card flex flex-col sm:flex-row sm:items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold shrink-0">
                {pt.personalInfo?.name?.charAt(0) || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-700 dark:text-slate-200">{pt.personalInfo?.name || 'Unknown'}</p>
                <p className="text-xs text-text-muted">{pt.email}</p>
                <div className="flex gap-3 text-xs text-slate-500 mt-1">
                  <span>Blood: <strong className="font-mono text-red-500">{pt.personalInfo?.bloodGroup || '—'}</strong></span>
                  <span>Gender: {pt.personalInfo?.gender || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={pt.status || 'active'} />
                <button onClick={() => setSelected(pt)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                  <Eye size={16} />
                </button>
                <button onClick={() => handleDeactivate(pt.id, pt.status || 'active')} className={`p-1.5 rounded-lg transition-colors ${pt.status === 'inactive' ? 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                  <UserX size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Patient Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-border dark:border-slate-700 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold">{selected.personalInfo?.name?.charAt(0)}</div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selected.personalInfo?.name}</h3>
                <p className="text-text-muted">{selected.email}</p>
                <StatusBadge status={selected.status || 'active'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs">DOB</span> <span className="font-medium text-slate-700 dark:text-slate-300">{selected.personalInfo?.dob || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Gender</span> <span className="font-medium text-slate-700 dark:text-slate-300">{selected.personalInfo?.gender || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Blood Group</span> <span className="font-mono font-bold text-red-600">{selected.personalInfo?.bloodGroup || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Height/Weight</span> <span className="font-medium text-slate-700 dark:text-slate-300">{selected.personalInfo?.height || '-'} cm / {selected.personalInfo?.weight || '-'} kg</span></div>
            </div>
            <div>
              <span className="text-slate-500 block text-xs mb-1">Emergency Contacts</span>
              {(selected.emergencyContacts || []).length > 0 ? selected.emergencyContacts.map((c, i) => (
                <div key={i} className="text-sm bg-slate-50 dark:bg-slate-700 p-2 rounded flex justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{c.name} ({c.relation})</span>
                  <span className="font-mono text-primary-600">{c.phone}</span>
                </div>
              )) : <span className="text-sm text-slate-400">None</span>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagePatients;
