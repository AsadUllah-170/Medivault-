import React, { useState, useEffect } from 'react';
import { Save, Camera } from 'lucide-react';
import { PageHeader, FormField, LoadingSpinner } from '../../components/shared/UIComponents';
import { getDoctorById } from '../../services/adminService';
import { updateUserProfile } from '../../services/authService';
import { updateDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { serverTimestamp } from 'firebase/firestore';

const DoctorProfile = () => {
  const { user, profile, refreshProfile } = useAuthStore();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!user?.uid) return;
    getDoctorById(user.uid).then(d => {
      setDoctor(d);
      setForm({
        name: profile?.name || '',
        phone: profile?.phone || '',
        specialization: d?.specialization || '',
        licenseNumber: d?.licenseNumber || '',
        hospitalAffiliation: d?.hospitalAffiliation || '',
      });
      setLoading(false);
    });
  }, [user?.uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name: form.name, phone: form.phone });
      await updateDoc(doc(db, 'doctors', user.uid), {
        name: form.name,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber,
        hospitalAffiliation: form.hospitalAffiliation,
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateUserProfile(user.uid, { profilePhoto: url });
      await refreshProfile();
      toast.success('Photo updated!');
    } catch { toast.error('Upload failed.'); }
    finally { setUploading(false); }
  };

  if (loading) return <div className="card animate-pulse h-64" />;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your professional information" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {profile?.profilePhoto ? <img src={profile.profilePhoto} alt="" className="w-full h-full object-cover" /> : profile?.name?.charAt(0) || 'D'}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">Dr. {profile?.name}</h3>
          <p className="text-sm text-text-muted">{doctor?.specialization}</p>
          <div className="mt-4 space-y-2 text-left">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-xs text-text-muted">License</span>
              <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{doctor?.licenseNumber}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-xs text-text-muted">Status</span>
              <span className={`badge capitalize ${doctor?.status === 'approved' ? 'badge-green' : doctor?.status === 'pending' ? 'badge-amber' : 'badge-red'}`}>{doctor?.status || 'pending'}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <h3 className="section-title mb-6">Professional Details</h3>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <FormField label="Full Name"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" /></FormField>
            <FormField label="Phone"><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" /></FormField>
            <FormField label="Specialization"><input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} className="input-field" /></FormField>
            <FormField label="License Number"><input value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} className="input-field font-mono" /></FormField>
            <div className="sm:col-span-2">
              <FormField label="Hospital Affiliation"><input value={form.hospitalAffiliation} onChange={e => setForm(f => ({ ...f, hospitalAffiliation: e.target.value }))} className="input-field" /></FormField>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary mt-2">
            {saving ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
