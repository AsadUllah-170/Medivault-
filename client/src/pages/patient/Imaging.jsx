import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scan, Upload, X, ZoomIn } from 'lucide-react';
import { PageHeader, FormField, LoadingSpinner, EmptyState, Modal } from '../../components/shared/UIComponents';
import { SkeletonList } from '../../components/shared/SkeletonLoaders';
import { getPatientImaging, uploadImaging } from '../../services/medicalService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const IMAGING_TYPES = ['X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'PET Scan', 'Other'];

const Imaging = () => {
  const { user } = useAuthStore();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ type: 'X-Ray', bodyPart: '', date: '', facility: '', notes: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    getPatientImaging(user.uid).then(setImages).catch(console.error).finally(() => setLoading(false));
  }, [user?.uid]);

  const handleUpload = async () => {
    if (!file || !form.bodyPart) { toast.error('Please fill required fields'); return; }
    setUploading(true);
    try {
      await uploadImaging(user.uid, user.uid, file, form);
      toast.success('Imaging uploaded!');
      setShowUpload(false);
      setForm({ type: 'X-Ray', bodyPart: '', date: '', facility: '', notes: '' });
      setFile(null);
      const updated = await getPatientImaging(user.uid);
      setImages(updated);
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const typeColors = { 'X-Ray': 'bg-slate-700', 'MRI': 'bg-purple-700', 'CT Scan': 'bg-blue-700', 'Ultrasound': 'bg-teal-700' };

  return (
    <div>
      <PageHeader
        title="X-Rays & Imaging"
        subtitle="Your medical imaging gallery"
        actions={
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            <Upload size={16} /> Upload Image
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : images.length === 0 ? (
        <EmptyState
          icon={Scan}
          title="No imaging records"
          description="Upload X-rays, MRIs, CT scans, or ultrasounds."
          action={<button onClick={() => setShowUpload(true)} className="btn-primary">Upload Image</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="card p-0 overflow-hidden hover:shadow-md transition-all group cursor-pointer"
              onClick={() => setLightbox(img)}
            >
              <div className="relative h-40 bg-slate-800 flex items-center justify-center overflow-hidden">
                {img.fileUrl ? (
                  <img src={img.fileUrl} alt={img.type} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Scan size={40} className="text-slate-500" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold text-white ${typeColors[img.type] || 'bg-slate-600'}`}>
                  {img.type}
                </span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{img.bodyPart}</p>
                <p className="text-xs text-text-muted mt-0.5">{img.date} • {img.facility}</p>
                {img.notes && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{img.notes}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-slate-300 z-10">
            <X size={28} />
          </button>
          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full">
            <img src={lightbox.fileUrl} alt={lightbox.type} className="w-full max-h-[80vh] object-contain rounded-xl" />
            <div className="text-center mt-4">
              <p className="text-white font-semibold">{lightbox.type} — {lightbox.bodyPart}</p>
              <p className="text-slate-400 text-sm">{lightbox.date} • {lightbox.facility}</p>
              {lightbox.notes && <p className="text-slate-300 text-sm mt-2">{lightbox.notes}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Imaging">
        <div className="space-y-0">
          <FormField label="Imaging Type">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
              {IMAGING_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Body Part / Region" required>
            <input value={form.bodyPart} onChange={e => setForm(f => ({ ...f, bodyPart: e.target.value }))} className="input-field" placeholder="e.g. Chest, Left Knee" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date">
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Facility">
              <input value={form.facility} onChange={e => setForm(f => ({ ...f, facility: e.target.value }))} className="input-field" placeholder="Hospital name" />
            </FormField>
          </div>
          <FormField label="Doctor Notes">
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none h-16" />
          </FormField>
          <FormField label="Image File" required>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
              <input type="file" accept="image/*,.pdf" className="hidden" id="img-file" onChange={e => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="img-file" className="cursor-pointer">
                {file ? <p className="text-sm text-secondary-600 font-medium">{file.name}</p> : (
                  <><Upload size={24} className="mx-auto text-slate-400 mb-1" /><p className="text-sm text-text-muted">Click to upload</p></>
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
    </div>
  );
};

export default Imaging;
