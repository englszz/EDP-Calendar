import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

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

// Firebase Messaging (solo si el navegador lo soporta)
export const messagingPromise = isSupported()
  .then((supported) => {
    if (supported) {
      return getMessaging(app);
    }
    return null;
  })
  .catch(() => null);

export default app;