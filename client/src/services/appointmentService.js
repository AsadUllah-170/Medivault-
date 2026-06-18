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
    reason,
    status: 'pending',
    notes: '',
    createdAt: serverTimestamp(),
  });
  await logAudit(patientId, 'APPOINTMENT_BOOKED', { appointmentId: ref.id, doctorId, date });
  await notifyUser(doctorId, {
    title: 'New Appointment Request',
    message: `A patient has requested an appointment on ${date} at ${timeSlot}.`,
    type: 'appointment',
    link: '/doctor/appointments',
  });
  return ref.id;
};

export const getPatientAppointments = async (patientId) => {
  const q = query(
    collection(db, 'appointments'),
    where('patientId', '==', patientId),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getDoctorAppointments = async (doctorId) => {
  const q = query(
    collection(db, 'appointments'),
    where('doctorId', '==', doctorId),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateAppointmentStatus = async (appointmentId, status, notes = '') => {
  await updateDoc(doc(db, 'appointments', appointmentId), {
    status,
    notes,
    updatedAt: serverTimestamp(),
  });
};

export const getAllAppointments = async () => {
  const snap = await getDocs(query(collection(db, 'appointments'), orderBy('date', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAppointment = async (id) => {
  const snap = await getDoc(doc(db, 'appointments', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
