import { getToken } from 'firebase/messaging';
import { messagingPromise } from '../config/firebase';

const VAPID_KEY = 'BE36k2GMvRYdOFUXh9UrTVki4fG0dSTwsYeifw4tERSNYPe3Vwf_uShEkUNL7i0UehZhcfzsEf19Af8Frs2cOnY';

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Permiso de notificaciones denegado');
      return null;
    }

    const messaging = await messagingPromise;

    if (!messaging) {
      console.log('Firebase Messaging no es compatible en este navegador');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    console.log('FCM Token:', token);

    return token;
  } catch (error) {
    console.error('Error obteniendo token de notificaciones:', error);
    return null;
  }
};