import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, MessageSquare, Clock } from 'lucide-react';
import { PageHeader, StatusBadge, Modal, FormField, LoadingSpinner, EmptyState } from '../../components/shared/UIComponents';
import { SkeletonList } from '../../components/shared/SkeletonLoaders';
import { getDoctorAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { getAllPatients } from '../../services/adminService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([getDoctorAppointments(user.uid), getAllPatients()])
      .then(([appts, pats]) => { setAppointments(appts); setPatients(pats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const getPatient = (id) => patients.find(p => p.id === id);

  const handleStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Appointment ${status}!`);
    } catch { toast.error('Action failed.'); }
  };

  const handleNote = async () => {
    if (!noteModal) return;
    setSaving(true);
    try {
      await updateAppointmentStatus(noteModal.id, 'completed', note);
      setAppointments(prev => prev.map(a => a.id === noteModal.id ? { ...a, status: 'completed', notes: note } : a));
      toast.success('Note saved and appointment completed!');
      setNoteModal(null);
      setNote('');
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
  const filtered = appointments.filter(a => filter === 'all' || a.status === filter);

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Manage patient appointment requests" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
              filter === f ? 'bg-primary-500 text-white border-primary-500' : 'border-border text-slate-600 hover:border-primary-300 dark:text-slate-300 dark:border-slate-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments" description="No appointments match the selected filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map(appt => {
            const patient = getPatient(appt.patientId);
            return (
              <div key={appt.id} className="card flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold shrink-0">
                  {patient?.personalInfo?.name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{patient?.personalInfo?.name || `Patient ${appt.patientId?.slice(0,6)}`}</p>
                  <p className="text-xs text-text-muted">{appt.reason || 'General Consultation'}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <Clock size={12} /> {appt.date} at {appt.timeSlot}
                  </div>
                  {appt.notes && <p className="text-xs italic text-slate-500 mt-1 bg-slate-50 dark:bg-slate-700 rounded-lg p-2">{appt.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={appt.status} />
                  {appt.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatus(appt.id, 'confirmed')} className="p-1.5 rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100 transition-colors">
                        <CheckCircle size={18} />
                      </button>
                      <button onClick={() => handleStatus(appt.id, 'cancelled')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  {appt.status === 'confirmed' && (
                    <button onClick={() => { setNoteModal(appt); setNote(appt.notes || ''); }} className="p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
                      <MessageSquare size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Modal */}
      <Modal isOpen={!!noteModal} onClose={() => setNoteModal(null)} title="Complete Appointment & Add Notes">
        <FormField label="Doctor's Notes">
          <textarea value={note} onChange={e => setNote(e.target.value)} className="input-field resize-none h-28" placeholder="Add consultation notes, follow-up advice..." />
        </FormField>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setNoteModal(null)} className="btn-outline flex-1 justify-center">Cancel</button>
          <button onClick={handleNote} disabled={saving} className="btn-primary flex-1 justify-center">
            {saving ? <LoadingSpinner size="sm" /> : 'Complete & Save'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
