import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const notifyUser = async (userId, { title, message, type, link }) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      link,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Notification failed:', err.message);
  }
};

export const getUserNotifications = async (userId) => {
  // Query by userId only, sort client-side to avoid composite index requirement
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
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

export const markNotificationRead = async (notificationId) => {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};

export const markAllRead = async (userId) => {
  const notifications = await getUserNotifications(userId);
  const unread = notifications.filter((n) => !n.read);
  await Promise.all(unread.map((n) => markNotificationRead(n.id)));
};
