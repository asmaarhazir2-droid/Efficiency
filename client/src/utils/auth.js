import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { ensureUserProfile } from '../firebase/services';

export async function login(email, password) {
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return ensureUserProfile(credentials.user);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    const profile = await ensureUserProfile(firebaseUser);
    callback(profile);
  });
}

export async function logout() {
  await signOut(auth);
  window.location.href = '/';
}
