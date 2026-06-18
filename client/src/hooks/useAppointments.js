import { useState, useEffect } from 'react';
import { getPatientAppointments, getDoctorAppointments } from '../services/appointmentService';

export const useAppointments = (userId, role) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const fetcher = role === 'doctor' ? getDoctorAppointments : getPatientAppointments;
    fetcher(userId)
      .then(setAppointments)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId, role]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(
    (a) => a.date >= today && (a.status === 'confirmed' || a.status === 'pending')
  );
  const past = appointments.filter((a) => a.date < today || a.status === 'completed');

  return { appointments, upcoming, past, loading, error, setAppointments };
};
