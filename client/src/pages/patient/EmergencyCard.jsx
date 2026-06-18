import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Share2, Printer, Plus, X, QrCode, AlertTriangle } from 'lucide-react';
import { PageHeader, FormField, LoadingSpinner, Modal } from '../../components/shared/UIComponents';
import { SkeletonCard } from '../../components/shared/SkeletonLoaders';
import { getPatientById, updatePatientProfile } from '../../services/adminService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { QRCodeSVG as QRCode } from 'qrcode.react';

const EmergencyCard = () => {
  const { user, profile } = useAuthStore();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [editSection, setEditSection] = useState(null); // 'allergies' | 'conditions' | 'medications' | 'contacts'
  const [newItem, setNewItem] = useState('');
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });
  const printRef = useRef();

  const emergencyUrl = `${window.location.origin}/emergency/${user?.uid}`;

  useEffect(() => {
    if (!user?.uid) return;
    getPatientById(user.uid).then(setPatient).catch(console.error).finally(() => setLoading(false));
  }, [user?.uid]);

  const addItem = async (field) => {
    if (!newItem.trim()) return;
    const updated = [...(patient?.[field] || []), newItem.trim()];
    setSaving(true);
    try {
      await updatePatientProfile(user.uid, { [field]: updated });
      setPatient(p => ({ ...p, [field]: updated }));
      setNewItem('');
      toast.success('Updated!');
    } catch { toast.error('Failed.'); }
    finally { setSaving(false); }
  };

  const removeItem = async (field, idx) => {
    const updated = (patient?.[field] || []).filter((_, i) => i !== idx);
    await updatePatientProfile(user.uid, { [field]: updated });
    setPatient(p => ({ ...p, [field]: updated }));
  };

  const addContact = async () => {
    if (!newContact.name) return;
    const updated = [...(patient?.emergencyContacts || []), { ...newContact }];
    setSaving(true);
    try {
      await updatePatientProfile(user.uid, { emergencyContacts: updated });
      setPatient(p => ({ ...p, emergencyContacts: updated }));
      setNewContact({ name: '', relation: '', phone: '' });
      toast.success('Contact added!');
    } catch { toast.error('Failed.'); }
    finally { setSaving(false); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(emergencyUrl);
    toast.success('Emergency link copied to clipboard!');
  };

  if (loading) return <SkeletonCard />;

  const pi = patient?.personalInfo || {};

  return (
    <div>
      <PageHeader
        title="Emergency Card"
        subtitle="Critical medical information for emergencies"
        actions={
          <div className="flex gap-2">
            <button onClick={handleShare} className="btn-outline"><Share2 size={16} /> Share Link</button>
            <button onClick={() => setShowQR(true)} className="btn-outline"><QrCode size={16} /> QR Code</button>
            <button onClick={() => window.print()} className="btn-primary"><Printer size={16} /> Print</button>
          </div>
        }
      />

      {/* Emergency Card */}
      <div ref={printRef} className="max-w-3xl mx-auto">
        <div className="border-2 border-red-500 rounded-2xl overflow-hidden shadow-lg">
          {/* Red Banner */}
          <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
            <AlertTriangle size={24} className="text-white" />
            <div>
              <h2 className="text-white font-bold text-lg">EMERGENCY MEDICAL INFORMATION</h2>
              <p className="text-red-100 text-sm">In case of emergency — please use this information</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-white dark:bg-slate-800 p-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold shrink-0 overflow-hidden">
                {profile?.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="" className="w-full h-full object-cover" />
                ) : profile?.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{pi.name || profile?.name}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>DOB: <strong>{pi.dob || '—'}</strong></span>
                  <span>Gender: <strong>{pi.gender || '—'}</strong></span>
                </div>
              </div>
              <div className="ml-auto text-center">
                <div className="w-16 h-16 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-600 font-mono">{pi.bloodGroup || '?'}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Blood Group</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {/* Allergies */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2 flex items-center justify-between">
                  ⚠️ Allergies
                  <button onClick={() => setEditSection('allergies')} className="text-xs text-red-500 hover:underline no-print">Edit</button>
                </p>
                {(patient?.allergies || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">None listed</p>
                ) : (
                  <ul className="space-y-1">
                    {patient.allergies.map((a, i) => (
                      <li key={i} className="text-sm font-medium text-red-800 dark:text-red-300">• {a}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Chronic Conditions */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2 flex items-center justify-between">
                  🏥 Conditions
                  <button onClick={() => setEditSection('chronicConditions')} className="text-xs text-amber-500 hover:underline no-print">Edit</button>
                </p>
                {(patient?.chronicConditions || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">None listed</p>
                ) : (
                  <ul className="space-y-1">
                    {patient.chronicConditions.map((c, i) => (
                      <li key={i} className="text-sm font-medium text-amber-800 dark:text-amber-300">• {c}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Current Medications */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
                <p className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wide mb-2 flex items-center justify-between">
                  💊 Medications
                  <button onClick={() => setEditSection('currentMedications')} className="text-xs text-primary-500 hover:underline no-print">Edit</button>
                </p>
                {(patient?.currentMedications || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">None listed</p>
                ) : (
                  <ul className="space-y-1">
                    {patient.currentMedications.map((m, i) => (
                      <li key={i} className="text-sm font-medium text-primary-800 dark:text-primary-300">• {m}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center justify-between">
                📞 Emergency Contacts
                <button onClick={() => setEditSection('contacts')} className="text-xs text-primary-500 hover:underline no-print">Add Contact</button>
              </p>
              {(patient?.emergencyContacts || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No emergency contacts listed</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {patient.emergencyContacts.map((c, i) => (
                    <div key={i} className="bg-white dark:bg-slate-600 rounded-lg p-3">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">{c.name}</p>
                      <p className="text-xs text-text-muted">{c.relation}</p>
                      <p className="text-sm font-mono text-primary-600 mt-1">{c.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Section Modal */}
      <Modal
        isOpen={!!editSection && editSection !== 'contacts'}
        onClose={() => { setEditSection(null); setNewItem(''); }}
        title={`Edit ${editSection === 'allergies' ? 'Allergies' : editSection === 'chronicConditions' ? 'Chronic Conditions' : 'Medications'}`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {(patient?.[editSection] || []).map((item, i) => (
              <span key={i} className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm">
                {item}
                <button onClick={() => removeItem(editSection, i)} className="text-slate-400 hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem(editSection)}
              className="input-field flex-1"
              placeholder="Add new item..."
            />
            <button onClick={() => addItem(editSection)} disabled={saving} className="btn-primary shrink-0">
              {saving ? <LoadingSpinner size="sm" /> : <Plus size={16} />}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Contact Modal */}
      <Modal isOpen={editSection === 'contacts'} onClose={() => setEditSection(null)} title="Add Emergency Contact">
        <div className="space-y-0">
          <FormField label="Contact Name"><input value={newContact.name} onChange={e => setNewContact(c => ({ ...c, name: e.target.value }))} className="input-field" placeholder="John Doe" /></FormField>
          <FormField label="Relation"><input value={newContact.relation} onChange={e => setNewContact(c => ({ ...c, relation: e.target.value }))} className="input-field" placeholder="Spouse / Parent" /></FormField>
          <FormField label="Phone"><input value={newContact.phone} onChange={e => setNewContact(c => ({ ...c, phone: e.target.value }))} className="input-field" placeholder="+92 300 0000000" /></FormField>
          <button onClick={addContact} disabled={saving} className="btn-primary w-full justify-center mt-4">
            {saving ? <LoadingSpinner size="sm" /> : 'Add Contact'}
          </button>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="Emergency QR Code">
        <div className="text-center">
          <p className="text-sm text-text-muted mb-6">Scan to access emergency medical information without login</p>
          <div className="inline-block p-4 bg-white rounded-2xl shadow-md">
            <QRCode value={emergencyUrl} size={200} level="H" />
          </div>
          <p className="text-xs font-mono text-text-muted mt-4 break-all">{emergencyUrl}</p>
          <button onClick={handleShare} className="btn-primary mx-auto mt-4">
            <Share2 size={16} /> Copy Link
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EmergencyCard;
