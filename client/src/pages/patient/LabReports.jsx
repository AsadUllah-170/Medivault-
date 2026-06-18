import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Upload, Eye, X } from 'lucide-react';
import { PageHeader, Modal, FormField, LoadingSpinner, EmptyState } from '../../components/shared/UIComponents';
import { SkeletonList } from '../../components/shared/SkeletonLoaders';
import { getPatientLabReports, uploadLabReport } from '../../services/medicalService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LabReports = () => {
  const { user } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ testName: '', date: '', labName: '', resultSummary: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    getPatientLabReports(user.uid).then(setReports).catch(console.error).finally(() => setLoading(false));
  }, [user?.uid]);

  const handleUpload = async () => {
    if (!file || !form.testName) { toast.error('Please fill required fields'); return; }
    setUploading(true);
    try {
      await uploadLabReport(user.uid, user.uid, file, form);
      toast.success('Lab report uploaded!');
      setShowUpload(false);
      setForm({ testName: '', date: '', labName: '', resultSummary: '' });
      setFile(null);
      const updated = await getPatientLabReports(user.uid);
      setReports(updated);
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Lab Reports"
        subtitle="Upload and view your laboratory test results"
        actions={
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            <Upload size={16} /> Upload Report
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No lab reports yet"
          description="Upload your first lab report to get started."
          action={<button onClick={() => setShowUpload(true)} className="btn-primary">Upload Report</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="card hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                  <FlaskConical size={18} className="text-teal-600" />
                </div>
                <span className="text-xs font-mono text-text-muted">{report.date || '—'}</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{report.testName}</h3>
              <p className="text-xs text-text-muted mb-1">{report.labName}</p>
              {report.resultSummary && (
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-lg p-2 mt-2 line-clamp-2">{report.resultSummary}</p>
              )}
              <button onClick={() => setViewReport(report)} className="btn-outline w-full justify-center mt-3 text-xs py-2">
                <Eye size={14} /> View Report
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Lab Report">
        <div className="space-y-0">
          <FormField label="Test Name" required>
            <input value={form.testName} onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} className="input-field" placeholder="e.g. Complete Blood Count" />
          </FormField>
          <FormField label="Test Date">
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
          </FormField>
          <FormField label="Lab / Facility Name">
            <input value={form.labName} onChange={e => setForm(f => ({ ...f, labName: e.target.value }))} className="input-field" placeholder="City Diagnostic Lab" />
          </FormField>
          <FormField label="Result Summary">
            <textarea value={form.resultSummary} onChange={e => setForm(f => ({ ...f, resultSummary: e.target.value }))} className="input-field resize-none h-20" placeholder="Brief summary of results..." />
          </FormField>
          <FormField label="Report File (PDF or Image)" required>
            <div className="border-2 border-dashed border-border dark:border-slate-600 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
              <input type="file" accept=".pdf,image/*" className="hidden" id="lab-file" onChange={e => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="lab-file" className="cursor-pointer">
                {file ? (
                  <p className="text-sm text-secondary-600 font-medium">{file.name}</p>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-text-muted">Click to upload PDF or image</p>
                  </>
                )}
              </label>
            </div>
          </FormField>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowUpload(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button onClick={handleUpload} disabled={uploading} className="btn-primary flex-1 justify-center">
              {uploading ? <LoadingSpinner size="sm" /> : 'Upload'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Report Modal */}
      <Modal isOpen={!!viewReport} onClose={() => setViewReport(null)} title={viewReport?.testName} maxWidth="max-w-2xl">
        {viewReport && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="text-xs text-text-muted">Date</p><p className="font-medium text-sm">{viewReport.date || '—'}</p></div>
              <div><p className="text-xs text-text-muted">Lab</p><p className="font-medium text-sm">{viewReport.labName || '—'}</p></div>
            </div>
            {viewReport.resultSummary && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Result Summary</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewReport.resultSummary}</p>
              </div>
            )}
            {viewReport.fileUrl && (
              <div className="border border-border dark:border-slate-700 rounded-xl overflow-hidden">
                {viewReport.fileName?.endsWith('.pdf') ? (
                  <iframe src={viewReport.fileUrl} className="w-full h-96" title="Lab Report PDF" />
                ) : (
                  <img src={viewReport.fileUrl} alt="Lab Report" className="w-full object-contain max-h-96" />
                )}
              </div>
            )}
            <a href={viewReport.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline w-full justify-center mt-4 text-sm">
              Open Full File
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabReports;
