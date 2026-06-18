import React, { useState, useEffect } from 'react';
import { Plus, Minus, Pill } from 'lucide-react';
import { PageHeader, FormField, LoadingSpinner } from '../../components/shared/UIComponents';
import { getAllPatients } from '../../services/adminService';
import { createPrescription } from '../../services/medicalService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const emptyMed = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

const WritePrescription = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [medications, setMedications] = useState([{ ...emptyMed }]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllPatients().then(setPatients).catch(console.error);
  }, []);

  const addMed = () => setMedications(m => [...m, { ...emptyMed }]);
  const removeMed = (i) => setMedications(m => m.filter((_, idx) => idx !== i));
  const updateMed = (i, field, val) => setMedications(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) { toast.error('Select a patient'); return; }
    if (!medications[0].name) { toast.error('Add at least one medication'); return; }
    setSubmitting(true);
    try {
      await createPrescription(user.uid, patientId, {
        medications,
        notes,
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      toast.success('Prescription written successfully!');
      navigate('/doctor/appointments');
    } catch {
      toast.error('Failed to save prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Write Prescription" subtitle="Create a new prescription for a patient" />
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h3 className="section-title mb-4">Patient</h3>
            <FormField label="Select Patient" required>
              <select value={patientId} onChange={e => setPatientId(e.target.value)} className="input-field">
                <option value="">Choose patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.personalInfo?.name || 'Unknown'} — {p.email}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Medications</h3>
              <button type="button" onClick={addMed} className="btn-outline text-sm py-2">
                <Plus size={14} /> Add Medication
              </button>
            </div>

            {medications.map((med, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-3 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Pill size={16} className="text-purple-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Medication {i + 1}</span>
                  </div>
                  {medications.length > 1 && (
                    <button type="button" onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600">
                      <Minus size={16} />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <FormField label="Medicine Name" required>
                    <input value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} className="input-field" placeholder="e.g. Amoxicillin" />
                  </FormField>
                  <FormField label="Dosage">
                    <input value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} className="input-field" placeholder="e.g. 500mg" />
                  </FormField>
                  <FormField label="Frequency">
                    <select value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} className="input-field">
                      <option value="">Select...</option>
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Three times daily</option>
                      <option>Every 8 hours</option>
                      <option>Every 12 hours</option>
                      <option>As needed</option>
                      <option>Before meals</option>
                      <option>After meals</option>
                    </select>
                  </FormField>
                  <FormField label="Duration">
                    <input value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} className="input-field" placeholder="e.g. 7 days" />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField label="Special Instructions">
                      <input value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} className="input-field" placeholder="e.g. Take with water, avoid alcohol" />
                    </FormField>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <FormField label="General Notes / Advice">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field resize-none h-24" placeholder="Additional instructions for the patient..." />
            </FormField>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <LoadingSpinner size="sm" /> : <><Pill size={16} /> Submit Prescription</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WritePrescription;
