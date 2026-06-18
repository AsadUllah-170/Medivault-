import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get all available doctors for patient booking.
 * Fetches all doctors, excludes only 'suspended' ones, sorts client-side.
 * This avoids needing a Firestore composite index and handles legacy
 * 'pending' doctors (from before auto-approval was implemented).
 */
export const getAllDoctors = async () => {
  // Fetch all doctors (no where filter to avoid index issues)
  const snap = await getDocs(collection(db, 'doctors'));
  const result = [];
  for (const d of snap.docs) {
    const data = d.data();
    // Exclude suspended doctors only — show approved AND pending (legacy)
    if (data.status === 'suspended') continue;
    const userSnap = await getDoc(doc(db, 'users', d.id));
    result.push({
      id: d.id,
      ...data,
      email: userSnap.exists() ? userSnap.data().email : '',
    });
  }
  // Sort client-side by name
  return result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
};

/**
 * Get ALL doctors regardless of status (used by admin panel).
 */
export const getAllDoctorsAdmin = async () => {
  const snap = await getDocs(collection(db, 'doctors'));
  const result = [];
  for (const d of snap.docs) {
    const userSnap = await getDoc(doc(db, 'users', d.id));
    result.push({
      id: d.id,
      ...d.data(),
      email: userSnap.exists() ? userSnap.data().email : '',
    });
  }
  return result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};

export const getDoctorById = async (id) => {
  const snap = await getDoc(doc(db, 'doctors', id));
  if (!snap.exists()) return null;
  const userSnap = await getDoc(doc(db, 'users', id));
  return {
    id: snap.id,
    ...snap.data(),
    email: userSnap.exists() ? userSnap.data().email : '',
  };
};

export const updateDoctorStatus = async (doctorId, status) => {
  await updateDoc(doc(db, 'doctors', doctorId), { status, updatedAt: serverTimestamp() });
};

export const updateDoctorSchedule = async (doctorId, availability) => {
  await updateDoc(doc(db, 'doctors', doctorId), {
    availability,
    updatedAt: serverTimestamp(),
  });
};

export const updateDoctorBlockedDates = async (doctorId, blockedDates) => {
  await updateDoc(doc(db, 'doctors', doctorId), {
    blockedDates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Get all patients (used by doctors + admin).
 * Sorts client-side to avoid Firestore composite index on personalInfo.name.
 */
export const getAllPatients = async () => {
  const snap = await getDocs(collection(db, 'patients'));
  const result = [];
  for (const d of snap.docs) {
    const userSnap = await getDoc(doc(db, 'users', d.id));
    result.push({
      id: d.id,
      ...d.data(),
      email: userSnap.exists() ? userSnap.data().email : '',
      status: userSnap.exists() ? (userSnap.data().disabled ? 'inactive' : 'active') : 'active',
    });
  }
  // Sort client-side by name to avoid needing a Firestore composite index
  return result.sort((a, b) =>
    (a.personalInfo?.name || '').localeCompare(b.personalInfo?.name || '')
  );
};

export const getPatientById = async (id) => {
  const snap = await getDoc(doc(db, 'patients', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updatePatientProfile = async (patientId, data) => {
  await updateDoc(doc(db, 'patients', patientId), { ...data, updatedAt: serverTimestamp() });
};

export const getAdminStats = async () => {
  const [patientsSnap, doctorsSnap, appointmentsSnap, recordsSnap] = await Promise.all([
    getDocs(collection(db, 'patients')),
    getDocs(collection(db, 'doctors')),
    getDocs(collection(db, 'appointments')),
    getDocs(collection(db, 'records')),
  ]);
  return {
    totalPatients: patientsSnap.size,
    totalDoctors: doctorsSnap.size,
    totalAppointments: appointmentsSnap.size,
    totalRecords: recordsSnap.size,
  };
};
