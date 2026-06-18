import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
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
  const q = query(
    collection(db, 'records'),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getRecord = async (recordId) => {
  const snap = await getDoc(doc(db, 'records', recordId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllRecords = async () => {
  const snap = await getDocs(query(collection(db, 'records'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
