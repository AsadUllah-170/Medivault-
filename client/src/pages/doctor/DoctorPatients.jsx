import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ChevronRight, Activity } from 'lucide-react';
import { PageHeader, EmptyState } from '../../components/shared/UIComponents';
import { SkeletonList } from '../../components/shared/SkeletonLoaders';
import { getAllPatients } from '../../services/adminService';
import { getPatientRecords } from '../../services/recordService';
import { Modal } from '../../components/shared/UIComponents';
import { format } from 'date-fns';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    getAllPatients().then(setPatients).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSelectPatient = async (patient) => {
    setSelected(patient);
    setLoadingRecords(true);
    try {
      const records = await getPatientRecords(patient.id);
      setPatientRecords(records);
    } catch { setPatientRecords([]); }
    finally { setLoadingRecords(false); }
  };

  const filtered = patients.filter(p =>
    !search || p.personalInfo?.name?.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
  );

  const calcAge = (dob) => {
    if (!dob) return '—';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div>
      <PageHeader title="My Patients" subtitle="Search and view patient medical histories" />

      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient name or ID..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? (
        <EmptyState icon={User} title="No patients found" description="No patients match your search." />
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onClick={() => handleSelectPatient(p)}
              className="card flex items-center gap-4 p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold shrink-0">
                {p.personalInfo?.name?.charAt(0) || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-700 dark:text-slate-200">{p.personalInfo?.name || 'Unknown'}</p>
                <div className="flex gap-3 text-xs text-text-muted mt-0.5">
                  <span>Age: {calcAge(p.personalInfo?.dob)} yrs</span>
                  <span>Blood: <strong className="font-mono text-red-600">{p.personalInfo?.bloodGroup || '—'}</strong></span>
                  <span>Gender: {p.personalInfo?.gender || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'} capitalize`}>{p.status || 'active'}</span>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setPatientRecords([]); }} title="Patient Medical History" maxWidth="max-w-2xl">
        {selected && (
          <div>
            <div className="flex items-start gap-4 mb-6 pb-4 border-b border-border dark:border-slate-700">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
                {selected.personalInfo?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{selected.personalInfo?.name}</h3>
                <div className="flex gap-4 text-sm text-text-muted mt-1">
                  <span>DOB: {selected.personalInfo?.dob || '—'}</span>
                  <span>Blood: <strong className="text-red-600 font-mono">{selected.personalInfo?.bloodGroup || '—'}</strong></span>
                </div>
              </div>
            </div>

            {/* Medical Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['allergies', 'chronicConditions', 'currentMedications'].map((key) => (
                <div key={key} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  {(selected[key] || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">None</p>
                  ) : (
                    <ul>{selected[key].map((item, i) => <li key={i} className="text-xs text-slate-700 dark:text-slate-300">• {item}</li>)}</ul>
                  )}
                </div>
              ))}
            </div>

            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Medical Records</h4>
            {loadingRecords ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
              </div>
            ) : patientRecords.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No records found for this patient.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {patientRecords.map(rec => (
                  <div key={rec.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <Activity size={16} className="text-primary-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{rec.title || 'Record'}</p>
                      <p className="text-xs text-text-muted">{rec.date || '—'}</p>
                    </div>
                    <span className="badge-blue capitalize text-xs">{rec.type || 'general'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPatients;
