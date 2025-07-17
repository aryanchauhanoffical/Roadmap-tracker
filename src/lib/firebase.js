// Firebase configuration and initialization for SvelteKit
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAQBLCp4HLlknW3J_eHxTwHZpGizGKmT-w",
  authDomain: "roadmap-tracker-41f99.firebaseapp.com",
  projectId: "roadmap-tracker-41f99",
  storageBucket: "roadmap-tracker-41f99.firebasestorage.app",
  messagingSenderId: "470200081679",
  appId: "1:470200081679:web:36ec6423ccbcb06f2c727a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 