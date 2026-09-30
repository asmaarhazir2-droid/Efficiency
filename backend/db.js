const bcrypt = require('bcryptjs');
const { db } = require('./firebase');

const usersCollection = db.collection('users');
const dropdownCollection = db.collection('dropdown_options');
const entriesCollection = db.collection('entries');

async function initFirebase() {
  const snapshot = await usersCollection.where('email', '==', 'superadmin@example.com').limit(1).get();
  if (!snapshot.empty) return;

  const superHash = await bcrypt.hash('SuperAdmin123!', 10);
  const userHash = await bcrypt.hash('Password123!', 10);

  const userDocs = await Promise.all([
    usersCollection.add({ email: 'superadmin@example.com', password: superHash, role: 'superadmin' }),
    usersCollection.add({ email: 'user1@example.com', password: userHash, role: 'user' }),
    usersCollection.add({ email: 'user2@example.com', password: userHash, role: 'user' })
  ]);

  const user1Id = userDocs[1].id;
  const user2Id = userDocs[2].id;

  await Promise.all([
    dropdownCollection.add({ user_id: user1Id, label: 'Rouge', value: 'rouge', category: 'couleur' }),
    dropdownCollection.add({ user_id: user1Id, label: 'Bleu', value: 'bleu', category: 'couleur' }),
    dropdownCollection.add({ user_id: user2Id, label: 'Petit', value: 'petit', category: 'taille' }),
    dropdownCollection.add({ user_id: user2Id, label: 'Grand', value: 'grand', category: 'taille' })
  ]);

  const dropdownSnapshot = await dropdownCollection.get();
  const dropdowns = dropdownSnapshot.docs;

  await Promise.all([
    entriesCollection.add({ user_id: user1Id, dropdown_id: dropdowns[0].id, selected_value: 'rouge', category: 'couleur', created_at: new Date().toISOString() }),
    entriesCollection.add({ user_id: user2Id, dropdown_id: dropdowns[2].id, selected_value: 'petit', category: 'taille', created_at: new Date().toISOString() })
  ]);
}

async function getUserByEmail(email) {
  const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function getUserById(id) {
  const doc = await usersCollection.doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function getDropdownsByUser(userId) {
  const snapshot = await dropdownCollection.where('user_id', '==', userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function addDropdownOption(userId, option) {
  const doc = await dropdownCollection.add({ user_id: userId, ...option });
  return { id: doc.id, ...option };
}

async function getDropdownOptionById(id) {
  const doc = await dropdownCollection.doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function updateDropdownOption(id, option) {
  await dropdownCollection.doc(id).update(option);
}

async function deleteDropdownOption(id) {
  await dropdownCollection.doc(id).delete();
}

async function addEntry(entry) {
  await entriesCollection.add(entry);
}

async function getStatistics() {
  const userSnapshot = await usersCollection.where('role', '==', 'user').get();
  const users = userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const entriesSnapshot = await entriesCollection.get();
  const dropdownSnapshot = await dropdownCollection.get();

  const byUser = await Promise.all(users.map(async (user) => {
    const entries = await entriesCollection.where('user_id', '==', user.id).get();
    return { email: user.email, entries: entries.size };
  }));

  return {
    totalUsers: users.length,
    totalOptions: dropdownSnapshot.size,
    totalEntries: entriesSnapshot.size,
    byUser
  };
}

async function getAllDropdownsWithUser() {
  const snapshot = await dropdownCollection.get();
  const results = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const user = await getUserById(data.user_id);
    results.push({ id: doc.id, email: user?.email || '', ...data });
  }

  return results;
}

module.exports = {
  initFirebase,
  getUserByEmail,
  getUserById,
  getDropdownsByUser,
  addDropdownOption,
  getDropdownOptionById,
  updateDropdownOption,
  deleteDropdownOption,
  addEntry,
  getStatistics,
  getAllDropdownsWithUser
};
