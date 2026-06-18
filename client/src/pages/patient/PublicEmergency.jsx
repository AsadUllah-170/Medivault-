import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Phone, Heart, Pill } from 'lucide-react';
import { getPatientById } from '../../services/adminService';
import { getUserProfile } from '../../services/authService';
import { LoadingSpinner } from '../../components/shared/UIComponents';

const PublicEmergency = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([getPatientById(patientId), getUserProfile(patientId)])
      .then(([p, up]) => { setPatient(p); setUserProfile(up); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" center /></div>;
  if (!patient) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Patient Not Found</h1>
        <p className="text-slate-500 mt-2">This emergency card is not available or has been removed.</p>
      </div>
    </div>
  );

  const pi = patient.personalInfo || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Emergency Banner */}
        <div className="bg-red-600 text-white rounded-t-2xl px-6 py-5 flex items-center gap-4">
          <AlertTriangle size={32} />
          <div>
            <h1 className="text-2xl font-extrabold">EMERGENCY MEDICAL INFORMATION</h1>
            <p className="text-red-200 text-sm">This information is shared without login for emergency responders</p>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl p-6 space-y-6">
          {/* Identity */}
          <div className="flex items-center gap-5 pb-4 border-b border-slate-200">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {userProfile?.profilePhoto ? (
                <img src={userProfile.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (pi.name || userProfile?.name || 'P').charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{pi.name || userProfile?.name || 'Unknown'}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-1">
                <span>DOB: <strong>{pi.dob || '—'}</strong></span>
                <span>Gender: <strong>{pi.gender || '—'}</strong></span>
              </div>
            </div>
            <div className="ml-auto text-center">
              <div className="w-16 h-16 rounded-xl bg-red-100 border-2 border-red-400 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-600 font-mono">{pi.bloodGroup || '?'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Blood Group</p>
            </div>
          </div>

          {/* Critical Info Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">⚠️ Allergies</p>
              {(patient.allergies || []).length === 0 ? <p className="text-sm text-slate-400">None</p> : (
                <ul>{patient.allergies.map((a, i) => <li key={i} className="text-sm font-semibold text-red-800">• {a}</li>)}</ul>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">🏥 Conditions</p>
              {(patient.chronicConditions || []).length === 0 ? <p className="text-sm text-slate-400">None</p> : (
                <ul>{patient.chronicConditions.map((c, i) => <li key={i} className="text-sm font-semibold text-amber-800">• {c}</li>)}</ul>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">💊 Medications</p>
              {(patient.currentMedications || []).length === 0 ? <p className="text-sm text-slate-400">None</p> : (
                <ul>{patient.currentMedications.map((m, i) => <li key={i} className="text-sm font-semibold text-blue-800">• {m}</li>)}</ul>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Phone size={14} /> Emergency Contacts
            </p>
            {(patient.emergencyContacts || []).length === 0 ? (
              <p className="text-sm text-slate-400">No contacts listed</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {patient.emergencyContacts.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {c.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.relation}</p>
                      <a href={`tel:${c.phone}`} className="text-primary-600 font-mono text-sm font-semibold">{c.phone}</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 text-center border-t border-slate-100 pt-4">
            Generated by MediVault — Cloud Medical Record System
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicEmergency;
