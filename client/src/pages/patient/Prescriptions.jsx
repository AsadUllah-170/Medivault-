import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pill, Download, Printer } from 'lucide-react';
import { PageHeader, StatusBadge, Modal, EmptyState } from '../../components/shared/UIComponents';
import { SkeletonList } from '../../components/shared/SkeletonLoaders';
import { getPatientPrescriptions } from '../../services/medicalService';
import useAuthStore from '../../store/authStore';
import { format } from 'date-fns';

const Prescriptions = () => {
  const { user, profile } = useAuthStore();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    if (!user?.uid) return;
    getPatientPrescriptions(user.uid).then(setPrescriptions).catch(console.error).finally(() => setLoading(false));
  }, [user?.uid]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader title="Prescriptions" subtitle="All your medical prescriptions" />

      {loading ? (
        <SkeletonList count={4} />
      ) : prescriptions.length === 0 ? (
        <EmptyState icon={Pill} title="No prescriptions yet" description="Your prescriptions will appear here once your doctor writes them." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {prescriptions.map((rx, i) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelected(rx)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Pill size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">
                      {rx.date || (rx.createdAt?.toDate ? format(rx.createdAt.toDate(), 'MMM dd, yyyy') : '—')}
                    </p>
                  </div>
                </div>
                <StatusBadge status={rx.status} />
              </div>
              <div className="space-y-1">
                {(rx.medications || []).slice(0, 3).map((med, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{med.name}</span>
                    <span className="text-text-muted text-xs">— {med.dosage}</span>
                  </div>
                ))}
                {(rx.medications?.length || 0) > 3 && (
                  <p className="text-xs text-text-muted pl-3">+{rx.medications.length - 3} more medications</p>
                )}
              </div>
              {rx.notes && <p className="text-xs text-text-muted mt-3 border-t border-border dark:border-slate-700 pt-2">{rx.notes}</p>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Prescription Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Prescription Details" maxWidth="max-w-xl">
        {selected && (
          <div ref={printRef}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-text-muted">Date: {selected.date || '—'}</p>
                <StatusBadge status={selected.status} />
              </div>
              <button onClick={handlePrint} className="btn-outline text-xs px-3 py-1.5">
                <Printer size={14} /> Print
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Medications</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2 text-xs text-text-muted font-semibold">Medicine</th>
                    <th className="pb-2 text-xs text-text-muted font-semibold">Dosage</th>
                    <th className="pb-2 text-xs text-text-muted font-semibold">Frequency</th>
                    <th className="pb-2 text-xs text-text-muted font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.medications || []).map((med, i) => (
                    <tr key={i} className="border-t border-slate-200 dark:border-slate-600">
                      <td className="py-2 font-semibold text-slate-800 dark:text-slate-200">{med.name}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400 font-mono text-xs">{med.dosage}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400 text-xs">{med.frequency}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400 text-xs">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selected.notes && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Doctor's Note: </span>{selected.notes}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Prescriptions;
