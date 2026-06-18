import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
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
  // Notify the patient that a new prescription has been written for them
  await notifyUser(patientId, {
    title: 'New Prescription',
    message: 'Your doctor has written a new prescription for you.',
    type: 'prescription',
    link: '/patient/prescriptions',
  });
  return ref2.id;
};

export const getPatientPrescriptions = async (patientId) => {
  // Query by patientId only — sort client-side to avoid composite index
  const q = query(
    collection(db, 'prescriptions'),
    where('patientId', '==', patientId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort by createdAt descending (most recent first)
  return results.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
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
  // Query by patientId only — sort client-side
  const q = query(
    collection(db, 'labReports'),
    where('patientId', '==', patientId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return results.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
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
    fileName: file.name,
    createdAt: serverTimestamp(),
  });
  await logAudit(doctorId, 'IMAGING_UPLOADED', { imagingId: docRef.id, patientId });
  await notifyUser(patientId, {
    title: 'New Imaging Report',
    message: `Your imaging report (${imagingData.type || 'Scan'}) is now available.`,
    type: 'imaging',
    link: '/patient/imaging',
  });
  return docRef.id;
};

export const getPatientImaging = async (patientId) => {
  // Query by patientId only — sort client-side
  const q = query(
    collection(db, 'imaging'),
    where('patientId', '==', patientId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return results.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
};
