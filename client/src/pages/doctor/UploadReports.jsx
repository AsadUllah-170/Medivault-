import React, { useState, useEffect } from 'react';
import { Upload, FileText } from 'lucide-react';
import { PageHeader, FormField, LoadingSpinner } from '../../components/shared/UIComponents';
import { getAllPatients } from '../../services/adminService';
import { uploadLabReport, uploadImaging } from '../../services/medicalService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const REPORT_TYPES = ['Lab', 'X-Ray', 'Imaging', 'MRI', 'CT Scan', 'Other'];

const UploadReports = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    patientId: '', reportType: 'Lab', testName: '', date: '', labName: '',
    description: '', bodyPart: '',
  });

  useEffect(() => {
    getAllPatients().then(setPatients).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !file) { toast.error('Patient and file are required'); return; }
    setSubmitting(true);
    try {
      const isImaging = ['X-Ray', 'Imaging', 'MRI', 'CT Scan'].includes(form.reportType);
      if (isImaging) {
        await uploadImaging(form.patientId, user.uid, file, {
          type: form.reportType,
          bodyPart: form.bodyPart || form.testName,
          date: form.date || format(new Date(), 'yyyy-MM-dd'),
          facility: form.labName,
          notes: form.description,
        });
      } else {
        await uploadLabReport(user.uid, form.patientId, file, {
          testName: form.testName,
          date: form.date || format(new Date(), 'yyyy-MM-dd'),
          labName: form.labName,
          resultSummary: form.description,
        });
      }
      toast.success('Report uploaded successfully!');
      navigate('/doctor/patients');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isImaging = ['X-Ray', 'Imaging', 'MRI', 'CT Scan'].includes(form.reportType);

  return (
    <div>
      <PageHeader title="Upload Reports" subtitle="Upload lab or imaging reports for a patient" />
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <FormField label="Select Patient" required>
              <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-field">
                <option value="">Choose patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.personalInfo?.name || 'Unknown'}</option>)}
              </select>
            </FormField>
            <FormField label="Report Type">
              <div className="flex flex-wrap gap-2">
                {REPORT_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, reportType: t }))}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      form.reportType === t ? 'bg-primary-500 text-white border-primary-500' : 'border-border text-slate-600 hover:border-primary-300 dark:text-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label={isImaging ? 'Body Part / Region' : 'Test Name'} required>
              <input value={isImaging ? form.bodyPart : form.testName} onChange={e => setForm(f => isImaging ? { ...f, bodyPart: e.target.value } : { ...f, testName: e.target.value })} className="input-field" placeholder={isImaging ? 'e.g. Chest, Left Knee' : 'e.g. CBC, Lipid Panel'} />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Date">
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
              </FormField>
              <FormField label="Lab / Facility Name">
                <input value={form.labName} onChange={e => setForm(f => ({ ...f, labName: e.target.value }))} className="input-field" placeholder="Facility name" />
              </FormField>
            </div>
            <FormField label="Description / Notes">
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none h-20" placeholder="Result summary or additional notes..." />
            </FormField>
            <FormField label="Report File" required>
              <div className="border-2 border-dashed border-border dark:border-slate-600 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                <input type="file" accept=".pdf,image/*" className="hidden" id="report-file" onChange={e => setFile(e.target.files?.[0] || null)} />
                <label htmlFor="report-file" className="cursor-pointer">
                  {file ? (
                    <p className="text-sm text-secondary-600 font-medium">{file.name}</p>
                  ) : (
                    <>
                      <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-text-muted">Click to upload PDF or image</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </FormField>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <LoadingSpinner size="sm" /> : <><Upload size={16} /> Upload Report</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadReports;
