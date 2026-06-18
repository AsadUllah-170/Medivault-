import React, { useState, useEffect } from 'react';
import { Activity, FileText } from 'lucide-react';
import { PageHeader, FormField, LoadingSpinner } from '../../components/shared/UIComponents';
import { getAllPatients } from '../../services/adminService';
import { createRecord } from '../../services/recordService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const AddDiagnosis = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientId: '', chiefComplaint: '', title: '', notes: '', ICD10: '',
    severity: 'Mild', followUpDate: '',
  });

  useEffect(() => {
    getAllPatients().then(setPatients).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.title) { toast.error('Patient and diagnosis title are required'); return; }
    setSubmitting(true);
    try {
      await createRecord(user.uid, form.patientId, {
        type: 'diagnosis',
        title: form.title,
        date: format(new Date(), 'yyyy-MM-dd'),
        content: {
          diagnosis: form.title,
          chiefComplaint: form.chiefComplaint,
          notes: form.notes,
          ICD10: form.ICD10,
          severity: form.severity,
          followUpDate: form.followUpDate,
        },
        files: [],
      });
      toast.success('Diagnosis recorded successfully!');
      navigate('/doctor/patients');
    } catch {
      toast.error('Failed to save diagnosis.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Add Diagnosis" subtitle="Record a clinical diagnosis for a patient" />
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h3 className="section-title mb-4">Patient & Diagnosis</h3>
            <FormField label="Select Patient" required>
              <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-field">
                <option value="">Choose patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.personalInfo?.name || 'Unknown'}</option>)}
              </select>
            </FormField>
            <FormField label="Chief Complaint">
              <input value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} className="input-field" placeholder="Patient's primary complaint..." />
            </FormField>
            <FormField label="Diagnosis Title" required>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="e.g. Type 2 Diabetes Mellitus" />
            </FormField>
            <FormField label="Detailed Notes">
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none h-28" placeholder="Clinical observations, examination findings..." />
            </FormField>
            <div className="grid sm:grid-cols-3 gap-4">
              <FormField label="ICD-10 Code">
                <input value={form.ICD10} onChange={e => setForm(f => ({ ...f, ICD10: e.target.value }))} className="input-field font-mono" placeholder="E11.9" />
              </FormField>
              <FormField label="Severity">
                <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="input-field">
                  <option>Mild</option>
                  <option>Moderate</option>
                  <option>Severe</option>
                </select>
              </FormField>
              <FormField label="Follow-up Date">
                <input type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} className="input-field" />
              </FormField>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <LoadingSpinner size="sm" /> : <><Activity size={16} /> Save Diagnosis</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiagnosis;
