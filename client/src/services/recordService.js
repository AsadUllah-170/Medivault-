import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { logAudit } from './auditService';
import { notifyUser } from './notificationService';

export const createRecord = async (doctorId, patientId, recordData) => {
  const ref = await addDoc(collection(db, 'records'), {
    ...recordData,
    patientId,
    doctorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logAudit(doctorId, 'RECORD_CREATED', { recordId: ref.id, patientId });
  await notifyUser(patientId, {
    title: 'New Medical Record',
    message: 'A new medical record has been added to your profile.',
    type: 'record',
    link: '/patient/records',
  });
  return ref.id;
};

export const getPatientRecords = async (patientId) => {
  // Query by patientId only — sort client-side to avoid composite index requirement
  const q = query(
    collection(db, 'records'),
    where('patientId', '==', patientId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort by createdAt descending
  return results.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
};

export const getRecord = async (recordId) => {
  const snap = await getDoc(doc(db, 'records', recordId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllRecords = async () => {
  const snap = await getDocs(collection(db, 'records'));
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort by createdAt descending
  return results.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
};
