import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from './config';

function getYesterdayRange() {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 1);
  return { start, end };
}

async function getUserEmailById(id) {
  const userDoc = await getDoc(doc(db, 'users', id));
  return userDoc.exists() ? userDoc.data().email || '' : '';
}

export async function ensureUserProfile(firebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const role = firebaseUser.email === 'superadmin@example.com' ? 'superadmin' : 'user';
    await setDoc(userRef, {
      email: firebaseUser.email,
      role,
      created_at: serverTimestamp()
    });
    return { id: firebaseUser.uid, email: firebaseUser.email, role };
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    email: data.email || firebaseUser.email,
    role: data.role || 'user'
  };
}

export async function getUserDropdowns(userId) {
  const dropdownQuery = query(collection(db, 'dropdown_options'), where('user_id', '==', userId));
  const snapshot = await getDocs(dropdownQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function addUserEntry(entry) {
  await addDoc(collection(db, 'entries'), {
    ...entry,
    created_at: serverTimestamp()
  });
}

export async function getLatestUserEntries(userId) {
  const snapshot = await getDocs(query(
    collection(db, 'entries'),
    where('user_id', '==', userId)
  ));
  const entries = snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((entry) => entry.created_at?.toDate?.())
    .sort((first, second) => second.created_at.toMillis() - first.created_at.toMillis());

  if (entries.length === 0) {
    return { entries: [], reportDate: null };
  }

  const latestDate = entries[0].created_at.toDate();
  const start = new Date(latestDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    entries: entries.filter((entry) => {
      const createdAt = entry.created_at.toDate();
      return createdAt >= start && createdAt < end;
    }),
    reportDate: start
  };
}

export async function getAdminDropdowns(user) {
  if (user.role !== 'superadmin') {
    return getUserDropdowns(user.id);
  }

  const snapshot = await getDocs(collection(db, 'dropdown_options'));
  const rows = await Promise.all(snapshot.docs.map(async (item) => {
    const data = item.data();
    const email = await getUserEmailById(data.user_id);
    return { id: item.id, email, ...data };
  }));

  return rows;
}

export async function addDropdownOption(user, form) {
  if (user.role === 'superadmin') {
    throw new Error('Super Admin ne peut pas modifier les listes');
  }

  await addDoc(collection(db, 'dropdown_options'), {
    user_id: user.id,
    label: form.label,
    value: form.value,
    category: form.category
  });
}

export async function getStatistics() {
  const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'user')));
  const dropdownSnapshot = await getDocs(collection(db, 'dropdown_options'));
  const { start, end } = getYesterdayRange();
  const entriesSnapshot = await getDocs(query(
    collection(db, 'entries'),
    where('created_at', '>=', Timestamp.fromDate(start)),
    where('created_at', '<', Timestamp.fromDate(end))
  ));

  const users = usersSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  const entriesByUser = new Map();

  entriesSnapshot.docs.forEach((entryDoc) => {
    const data = entryDoc.data();
    const current = entriesByUser.get(data.user_id) || 0;
    entriesByUser.set(data.user_id, current + 1);
  });

  const byUser = users.map((user) => ({
    email: user.email,
    entries: entriesByUser.get(user.id) || 0
  }));

  return {
    totalUsers: users.length,
    totalOptions: dropdownSnapshot.size,
    totalEntries: entriesSnapshot.size,
    reportDate: start,
    byUser
  };
}
