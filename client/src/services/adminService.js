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
} from 'firebase/firestore';
import { db } from './firebase';

export const getAllDoctors = async () => {
  const snap = await getDocs(query(collection(db, 'doctors'), orderBy('name')));
  const result = [];
  for (const d of snap.docs) {
    const userSnap = await getDoc(doc(db, 'users', d.id));
    result.push({
      id: d.id,
      ...d.data(),
      email: userSnap.exists() ? userSnap.data().email : '',
    });
  }
  return result;
};

export const getDoctorById = async (id) => {
  const snap = await getDoc(doc(db, 'doctors', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
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

export const getAllPatients = async () => {
  const snap = await getDocs(query(collection(db, 'patients'), orderBy('personalInfo.name')));
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
  return result;
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
