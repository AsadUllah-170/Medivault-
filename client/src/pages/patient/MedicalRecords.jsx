import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Eye } from 'lucide-react';
import { PageHeader, Modal, StatusBadge, EmptyState } from '../../components/shared/UIComponents';
import { SkeletonList } from '../../components/shared/SkeletonLoaders';
import { getPatientRecords } from '../../services/recordService';
import useAuthStore from '../../store/authStore';
import { format } from 'date-fns';

const TYPES = ['All', 'diagnosis', 'lab', 'imaging', 'prescription', 'general'];

const MedicalRecords = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    getPatientRecords(user.uid).then(setRecords).catch(console.error).finally(() => setLoading(false));
  }, [user?.uid]);

  const filtered = records.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.content?.diagnosis?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <PageHeader title="Medical Records" subtitle="All your health records in one place" />

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or diagnosis..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  typeFilter === t
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-border text-slate-600 hover:border-primary-300 dark:text-slate-300 dark:border-slate-600'
                }`}
              >
                {t === 'All' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No records found" description="No medical records match your current filters." />
      ) : (
        <div className="space-y-3">
          {filtered.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card flex items-center gap-4 p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelected(rec)}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate">{rec.title || 'Medical Record'}</p>
                  <span className="badge-blue capitalize shrink-0">{rec.type || 'general'}</span>
                </div>
                <p className="text-xs text-text-muted truncate">{rec.content?.diagnosis || rec.content?.notes || 'No details'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-mono text-text-muted">{rec.date || '—'}</p>
                <button className="text-primary-500 hover:text-primary-700 mt-1 flex items-center gap-1 text-xs font-medium">
                  <Eye size={12} /> View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Record Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Record Details" maxWidth="max-w-2xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="badge-blue capitalize">{selected.type || 'general'}</span>
              <span className="text-xs font-mono text-text-muted">{selected.date || '—'}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{selected.title}</h3>
            {selected.content?.diagnosis && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Diagnosis</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{selected.content.diagnosis}</p>
              </div>
            )}
            {selected.content?.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{selected.content.notes}</p>
              </div>
            )}
            {selected.content?.ICD10 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">ICD-10 Code</p>
                <p className="text-sm font-mono text-primary-600">{selected.content.ICD10}</p>
              </div>
            )}
            {selected.files?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Attachments</p>
                <div className="space-y-2">
                  {selected.files.map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline text-sm">
                      <FileText size={14} /> {f.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;
