importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC-8uUGbnQO9Vvi68fmxn8zKzWJpGehT-g",
  authDomain: "edp-calendar-eb61d.firebaseapp.com",
  projectId: "edp-calendar-eb61d",
  storageBucket: "edp-calendar-eb61d.firebasestorage.app",
  messagingSenderId: "602816755218",
  appId: "1:602816755218:web:207c49c85694daedb34acb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};

  self.registration.showNotification(
    notification.title || 'EDP Calendar',
    {
      body: notification.body || 'Tienes una tarea pendiente.',
      icon: '/logo192.png',
      badge: '/logo192.png'
    }
  );
});