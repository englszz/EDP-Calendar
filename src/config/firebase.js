import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC-8uUGbnQO9Vvi68fmxn8zKzWJpGehT-g",
  authDomain: "edp-calendar-eb61d.firebaseapp.com",
  projectId: "edp-calendar-eb61d",
  storageBucket: "edp-calendar-eb61d.firebasestorage.app",
  messagingSenderId: "602816755218",
  appId: "1:602816755218:web:207c49c85694daedb34acb",
  measurementId: "G-SR1BW59KGY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
