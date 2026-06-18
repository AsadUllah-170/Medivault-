import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const logAudit = async (userId, action, metadata = {}) => {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      userId,
      action,
      metadata,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Audit log failed:', err.message);
  }
};
