importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

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
  console.log('📬 Notificación en background:', payload);

  const notificationTitle = payload.notification?.title || 'EDP Calendar';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes un evento próximo',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data || {}   // importante para clicks
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});