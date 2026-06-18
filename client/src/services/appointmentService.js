import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { logAudit } from './auditService';
import { notifyUser } from './notificationService';

export const bookAppointment = async ({ patientId, doctorId, date, timeSlot, reason }) => {
  const ref = await addDoc(collection(db, 'appointments'), {
    patientId,
    doctorId,
    date,
    timeSlot,
    reason: reason || '',
    status: 'pending',
    notes: '',
    createdAt: serverTimestamp(),
  });
  await logAudit(patientId, 'APPOINTMENT_BOOKED', { appointmentId: ref.id, doctorId, date });
  // Notify doctor of new appointment request
  await notifyUser(doctorId, {
    title: 'New Appointment Request',
    message: `A patient has requested an appointment on ${date} at ${timeSlot}.`,
    type: 'appointment',
    link: '/doctor/appointments',
  });
  return ref.id;
};

export const getPatientAppointments = async (patientId) => {
  // Query by patientId only — no orderBy to avoid needing a composite index
  const q = query(
    collection(db, 'appointments'),
    where('patientId', '==', patientId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side by date ascending
  return results.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
};

export const getDoctorAppointments = async (doctorId) => {
  // Query by doctorId only — no orderBy to avoid needing a composite index
  const q = query(
    collection(db, 'appointments'),
    where('doctorId', '==', doctorId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side by date ascending
  return results.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
};

export const updateAppointmentStatus = async (appointmentId, status, notes = '') => {
  await updateDoc(doc(db, 'appointments', appointmentId), {
    status,
    notes,
    updatedAt: serverTimestamp(),
  });
};

export const getAllAppointments = async () => {
  const snap = await getDocs(collection(db, 'appointments'));
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side by date descending
  return results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
};

export const getAppointment = async (id) => {
  const snap = await getDoc(doc(db, 'appointments', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
