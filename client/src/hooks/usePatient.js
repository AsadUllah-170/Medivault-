import { useState, useEffect } from 'react';
import { getPatientById, updatePatientProfile } from '../services/adminService';

export const usePatient = (patientId) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    getPatientById(patientId)
      .then(setPatient)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [patientId]);

  const updateProfile = async (data) => {
    await updatePatientProfile(patientId, data);
    setPatient((prev) => ({ ...prev, ...data }));
  };

  return { patient, loading, error, updateProfile };
};
