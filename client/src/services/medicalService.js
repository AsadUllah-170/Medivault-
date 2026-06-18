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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { logAudit } from './auditService';
import { notifyUser } from './notificationService';

export const createPrescription = async (doctorId, patientId, data) => {
  const ref2 = await addDoc(collection(db, 'prescriptions'), {
    ...data,
    patientId,
    doctorId,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  await logAudit(doctorId, 'PRESCRIPTION_CREATED', { prescriptionId: ref2.id, patientId });
  await notifyUser(patientId, {
    title: 'New Prescription',
    message: 'Your doctor has written a new prescription for you.',
    type: 'prescription',
    link: '/patient/prescriptions',
  });
  return ref2.id;
};

export const getPatientPrescriptions = async (patientId) => {
  const q = query(
    collection(db, 'prescriptions'),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const uploadLabReport = async (doctorId, patientId, file, reportData) => {
  const storageRef = ref(storage, `lab-reports/${patientId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, 'labReports'), {
    ...reportData,
    patientId,
    doctorId,
    fileUrl,
    fileName: file.name,
    createdAt: serverTimestamp(),
  });
  await logAudit(doctorId, 'LAB_REPORT_UPLOADED', { reportId: docRef.id, patientId });
  await notifyUser(patientId, {
    title: 'New Lab Report',
    message: `Your lab report "${reportData.testName}" is now available.`,
    type: 'lab',
    link: '/patient/lab-reports',
  });
  return docRef.id;
};

export const getPatientLabReports = async (patientId) => {
  const q = query(
    collection(db, 'labReports'),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const uploadImaging = async (patientId, doctorId, file, imagingData) => {
  const storageRef = ref(storage, `imaging/${patientId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, 'imaging'), {
    ...imagingData,
    patientId,
    doctorId,
    fileUrl,
    createdAt: serverTimestamp(),
  });
  await logAudit(doctorId, 'IMAGING_UPLOADED', { imagingId: docRef.id, patientId });
  return docRef.id;
};

export const getPatientImaging = async (patientId) => {
  const q = query(
    collection(db, 'imaging'),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
