import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';
import type { Note } from './notes.service';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function connectNotes() {
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  const notes = collection(db, 'users', user.uid, 'notes');

  return {
    listen(onChange: (notes: readonly Note[]) => void, onError: (error: unknown) => void) {
      return onSnapshot(
        query(notes, orderBy('createdAt', 'desc')),
        { includeMetadataChanges: true },
        (snapshot) => {
          // Show only data confirmed by Firestore, not uncommitted local writes.
          if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) {
            onChange(
              snapshot.docs.map((entry) => ({
                id: entry.id,
                title: entry.get('title') as string,
                text: entry.get('text') as string,
              })),
            );
          }
        },
        onError,
      );
    },
    add(title: string, text: string) {
      return addDoc(notes, { title, text, createdAt: serverTimestamp() });
    },
    remove(id: string) {
      return deleteDoc(doc(notes, id));
    },
  };
}
