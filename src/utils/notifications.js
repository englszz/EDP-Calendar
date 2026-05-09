import { getToken } from 'firebase/messaging';
import { messagingPromise } from '../config/firebase';

const VAPID_KEY = 'BE36k2GMvRYdOFUXh9UrTVki4fG0dSTwsYeifw4tERSNYPe3Vwf_uShEkUNL7i0UehZhcfzsEf19Af8Frs2cOnY';

export const requestNotificationPermission = async () => {
  console.log('🚀 requestNotificationPermission ejecutado');

  try {
    const permission = await Notification.requestPermission();
    console.log('Permiso:', permission);

    if (permission !== 'granted') {
      console.log('Permiso denegado');
      return null;
    }

    const messaging = await messagingPromise;
    console.log('Messaging:', messaging);

    if (!messaging) {
      console.log('Firebase Messaging no soportado');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    console.log('Service Worker listo:', registration);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log('FCM Token:', token);

    return token;
  } catch (error) {
    console.error('Error en notificaciones:', error);
    return null;
  }
};