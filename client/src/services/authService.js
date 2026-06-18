import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { logAudit } from './auditService';

export const registerUser = async ({ email, password, role, profileData }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = cred;

  // base user doc
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email,
    role,
    name: profileData.name,
    phone: profileData.phone || '',
    profilePhoto: '',
    createdAt: serverTimestamp(),
    onboardingComplete: false,
  });

  // role-specific doc
  if (role === 'patient') {
    await setDoc(doc(db, 'patients', user.uid), {
      personalInfo: {
        name: profileData.name,
        dob: profileData.dob || '',
        gender: profileData.gender || '',
        bloodGroup: profileData.bloodGroup || '',
        height: '',
        weight: '',
      },
      emergencyContacts: profileData.emergencyContact
        ? [{ name: profileData.emergencyContact, relation: '', phone: '' }]
        : [],
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      onboardingStep: 0,
      createdAt: serverTimestamp(),
    });
  } else if (role === 'doctor') {
    await setDoc(doc(db, 'doctors', user.uid), {
      name: profileData.name,
      specialization: profileData.specialization || '',
      licenseNumber: profileData.licenseNumber || '',
      hospitalAffiliation: profileData.hospitalAffiliation || '',
      status: 'approved', // Auto-approved on registration; admin can suspend if needed
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slotDuration: 30,
        timeSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'],
      },
      blockedDates: [],
      createdAt: serverTimestamp(),
    });
  }

  await logAudit(user.uid, 'USER_REGISTERED', { role, email });
  return user;
};

export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
