import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Camera } from 'lucide-react';
import { PageHeader, FormField, LoadingSpinner } from '../../components/shared/UIComponents';
import { SkeletonCard } from '../../components/shared/SkeletonLoaders';
import useAuthStore from '../../store/authStore';
import { getPatientById, updatePatientProfile } from '../../services/adminService';
import { updateUserProfile } from '../../services/authService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const { user, profile, refreshProfile } = useAuthStore();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!user?.uid) return;
    getPatientById(user.uid).then(p => {
      setPatient(p);
      setForm({
        name: profile?.name || '',
        phone: profile?.phone || '',
        dob: p?.personalInfo?.dob || '',
        gender: p?.personalInfo?.gender || '',
        bloodGroup: p?.personalInfo?.bloodGroup || '',
        height: p?.personalInfo?.height || '',
        weight: p?.personalInfo?.weight || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.uid]);

  const bmi = form.height && form.weight
    ? (parseFloat(form.weight) / ((parseFloat(form.height) / 100) ** 2)).toFixed(1)
    : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateUserProfile(user.uid, { name: form.name, phone: form.phone }),
        updatePatientProfile(user.uid, {
          personalInfo: {
            name: form.name,
            dob: form.dob,
            gender: form.gender,
            bloodGroup: form.bloodGroup,
            height: form.height,
            weight: form.weight,
          }
        }),
      ]);
      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateUserProfile(user.uid, { profilePhoto: url });
      await refreshProfile();
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal and medical information" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Photo + Basic Info */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {profile?.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile?.name?.charAt(0)?.toUpperCase() || 'P'
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
              {uploading && <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center"><LoadingSpinner size="sm" /></div>}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">{profile?.name}</h3>
            <p className="text-sm text-text-muted">{profile?.email}</p>
            <div className="mt-4 space-y-2">
              {form.bloodGroup && <div className="flex items-center justify-between px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-xs text-red-600 font-medium">Blood Group</span>
                <span className="font-bold text-red-700 font-mono">{form.bloodGroup}</span>
              </div>}
              {bmi && <div className="flex items-center justify-between px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <span className="text-xs text-primary-600 font-medium">BMI</span>
                <span className="font-bold text-primary-700 font-mono">{bmi}</span>
              </div>}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="section-title mb-6">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <FormField label="Full Name">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
              </FormField>
              <FormField label="Phone Number">
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+92 300 0000000" />
              </FormField>
              <FormField label="Date of Birth">
                <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className="input-field" />
              </FormField>
              <FormField label="Gender">
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="input-field">
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </FormField>
              <FormField label="Blood Group">
                <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} className="input-field">
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                </select>
              </FormField>
              <FormField label="Height (cm)">
                <input type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} className="input-field" placeholder="175" />
              </FormField>
              <FormField label="Weight (kg)">
                <input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="input-field" placeholder="70" />
              </FormField>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary mt-2">
              {saving ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>

          {/* Allergies & Conditions */}
          <div className="card mt-6">
            <h3 className="section-title mb-4">Medical Background</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { key: 'allergies', label: 'Allergies', color: 'bg-red-100 text-red-700' },
                { key: 'chronicConditions', label: 'Chronic Conditions', color: 'bg-amber-100 text-amber-700' },
                { key: 'currentMedications', label: 'Current Medications', color: 'bg-primary-100 text-primary-700' },
              ].map(({ key, label, color }) => (
                <div key={key}>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">{label}</p>
                  {(patient?.[key] || []).length === 0 ? (
                    <p className="text-xs text-text-muted italic">None listed</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {patient[key].map((item, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{item}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-4">
              Update your allergies, conditions, and medications via the Emergency Card page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
