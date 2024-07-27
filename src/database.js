import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const signUp = async (email, password) => {
  await createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export const saveData = async (key, value) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  
  await addDoc(collection(db, key), {
    ...value,
    userId: user.uid
  });
};

export const getAllData = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  const data = {};
  const collections = ['categories', 'prompts', 'tags'];

  for (const collectionName of collections) {
    const q = query(collection(db, collectionName), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    data[collectionName] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  return data;
};
