import { getToken, onMessage } from 'firebase/messaging';
import { messagingPromise } from '../config/firebase';
import { db } from '../config/firebase';
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';

const VAPID_KEY = 'BE36k2GMvRYdOFUXh9UrTVki4fG0dSTwsYeifw4tERSNYPe3Vwf_uShEkUNL7i0UehZhcfzsEf19Af8Frs2cOnY';

// Detectar plataforma - FIX: iPads modernos reportan "Macintosh"
export const isIOS = () => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return true;
  // iPad en Safari 13+ se reporta como Macintosh pero tiene touch
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  return false;
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// Detectar si esta instalado como PWA (standalone)
export const isPWA = () => {
  return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
};

// Detectar si soporta notificaciones web
export const supportsWebNotifications = () => {
  return 'Notification' in window;
};

// Sistema hibrido de notificaciones
class NotificationSystem {
  constructor() {
    this.platform = this.detectPlatform();
    this.token = null;
    this.scheduledReminders = new Map();
    this.reminderUnsub = null;
  }

  detectPlatform() {
    if (isIOS()) return 'ios';
    if (isAndroid()) return 'android';
    return 'desktop';
  }

  // Solicitar permisos segun plataforma
  async requestPermission() {
    console.log(`Solicitando permisos en ${this.platform}`);

    try {
      // Verificar si las notificaciones web son soportadas
      if (!supportsWebNotifications()) {
        console.log('Notificaciones web no soportadas');
        return null;
      }

      // Si ya tiene permiso
      if (Notification.permission === 'granted') {
        return await this._setupAfterPermission();
      }

      // Si esta denegado
      if (Notification.permission === 'denied') {
        console.log('Permiso denegado por el usuario');
        return null;
      }

      // Solicitar permiso
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Permiso denegado');
        return null;
      }

      return await this._setupAfterPermission();
    } catch (error) {
      console.error('Error en permisos:', error);
      return null;
    }
  }

  async _setupAfterPermission() {
    // iOS: funciona tanto como local como FCM si esta en PWA
    if (this.platform === 'ios') {
      if (isPWA()) {
        console.log('iOS PWA: intentando FCM');
        return await this._setupFCM();
      }
      console.log('iOS Safari: usando notificaciones locales');
      return 'ios-local';
    }

    // Android/Desktop: intenta FCM
    return await this._setupFCM();
  }

  async _setupFCM() {
    try {
      const messaging = await messagingPromise;
      if (!messaging) {
        console.log('FCM no disponible, usando locales');
        return 'local';
      }

      let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!registration) {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }
      await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      this.token = token;
      console.log('FCM Token:', token);

      onMessage(messaging, (payload) => {
        this.showLocalNotification(
          payload.notification?.title || 'EDP Calendar',
          payload.notification?.body || 'Tienes una notificacion',
          payload.data
        );
      });

      return token;
    } catch (error) {
      console.error('Error FCM:', error);
      return 'local';
    }
  }

  // Mostrar notificacion local
  showLocalNotification(title, body, data = {}) {
    if (Notification.permission !== 'granted') {
      console.log('No hay permiso para notificaciones');
      return null;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: data.taskId || 'general',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (data.url) window.location.href = data.url;
      };

      return notification;
    } catch (error) {
      console.error('Error mostrando notificacion:', error);
      return null;
    }
  }

  // Programar recordatorio - PERSISTENTE en Firestore
  async scheduleReminder(task, minutesBefore = 30, userId) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    // Si task.dueDate es solo YYYY-MM-DD, asumir hora de la tarea o 9am
    if (!task.dueDate.includes('T')) {
      dueDate.setHours(9, 0, 0, 0);
    }
    
    const reminderTime = new Date(dueDate.getTime() - minutesBefore * 60000);
    const delay = reminderTime.getTime() - now.getTime();

    if (delay <= 0) {
      console.log('La tarea ya paso o es muy pronto');
      return null;
    }

    // Guardar en Firestore para persistencia
    if (userId) {
      try {
        await addDoc(collection(db, 'reminders'), {
          uid: userId,
          taskId: task.id,
          taskTitle: task.title,
          reminderTime: reminderTime.toISOString(),
          dueDate: task.dueDate,
          createdAt: now.toISOString(),
        });
        console.log('Recordatorio guardado en Firestore');
      } catch (error) {
        console.error('Error guardando recordatorio:', error);
      }
    }

    // Tambien programar localmente para feedback inmediato
    return this._scheduleLocal(task, minutesBefore, reminderTime);
  }

  _scheduleLocal(task, minutesBefore, reminderTime) {
    const delay = reminderTime.getTime() - Date.now();
    if (delay <= 0) return null;

    if (this.scheduledReminders.has(task.id)) {
      clearTimeout(this.scheduledReminders.get(task.id));
    }

    const timeoutId = setTimeout(() => {
      this.showLocalNotification(
        `Recordatorio: ${task.title}`,
        `Vence en ${minutesBefore} minutos`,
        { taskId: task.id, url: '/' }
      );
      this.scheduledReminders.delete(task.id);
    }, delay);

    this.scheduledReminders.set(task.id, timeoutId);
    return timeoutId;
  }

  // Verificar recordatorios pendientes al abrir la app
  checkPendingReminders(userId) {
    if (!userId) return;
    
    const now = new Date();
    const q = query(
      collection(db, 'reminders'),
      where('uid', '==', userId),
      where('reminderTime', '<=', now.toISOString())
    );

    getDocs(q).then(snapshot => {
      snapshot.forEach(async (docSnap) => {
        const reminder = docSnap.data();
        this.showLocalNotification(
          `Recordatorio: ${reminder.taskTitle}`,
          `Vence: ${reminder.dueDate}`,
          { taskId: reminder.taskId, url: '/' }
        );
        await deleteDoc(doc(db, 'reminders', docSnap.id));
      });
    }).catch(err => console.error('Error checking reminders:', err));
  }

  // Escuchar recordatorios pendientes en tiempo real
  listenPendingReminders(userId, callback) {
    if (!userId) return;
    
    const q = query(
      collection(db, 'reminders'),
      where('uid', '==', userId),
      orderBy('reminderTime', 'asc')
    );

    this.reminderUnsub = onSnapshot(q, (snapshot) => {
      const reminders = [];
      snapshot.forEach(doc => {
        reminders.push({ id: doc.id, ...doc.data() });
      });
      callback(reminders);
    });

    return this.reminderUnsub;
  }

  cancelReminder(taskId) {
    if (this.scheduledReminders.has(taskId)) {
      clearTimeout(this.scheduledReminders.get(taskId));
      this.scheduledReminders.delete(taskId);
    }
  }

  async cancelReminderInFirestore(taskId, userId) {
    if (!userId) return;
    const q = query(
      collection(db, 'reminders'),
      where('uid', '==', userId),
      where('taskId', '==', taskId)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, 'reminders', docSnap.id));
    });
  }

  // Generar link para calendario de iOS
  generateCalendarLink(task) {
    const startDate = new Date(task.dueDate);
    if (!task.dueDate.includes('T')) {
      startDate.setHours(9, 0, 0, 0);
    }
    const endDate = new Date(startDate.getTime() + 60 * 60000);

    const formatDateICS = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDateICS(startDate)}
DTEND:${formatDateICS(endDate)}
SUMMARY:${task.title}
DESCRIPTION:${task.description || ''}
BEGIN:VALARM
TRIGGER:-PT30M
DESCRIPTION:Recordatorio
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return 'data:text/calendar;charset=utf8,' + encodeURIComponent(calendar);
  }

  addToNativeCalendar(task) {
    const calendarUrl = this.generateCalendarLink(task);
    const link = document.createElement('a');
    link.href = calendarUrl;
    link.download = `${task.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  updateBadge(count) {
    if ('setAppBadge' in navigator) {
      if (count > 0) navigator.setAppBadge(count);
      else navigator.clearAppBadge();
    }
  }
}

export const notificationSystem = new NotificationSystem();

export const requestNotificationPermission = async () => {
  return await notificationSystem.requestPermission();
};

export const showNotification = (title, body, data) => {
  return notificationSystem.showLocalNotification(title, body, data);
};

export const scheduleTaskReminder = (task, minutesBefore = 30, userId) => {
  return notificationSystem.scheduleReminder(task, minutesBefore, userId);
};

export const cancelTaskReminder = (taskId, userId) => {
  notificationSystem.cancelReminder(taskId);
  notificationSystem.cancelReminderInFirestore(taskId, userId);
};

export const addTaskToCalendar = (task) => {
  return notificationSystem.addToNativeCalendar(task);
};

export const updateBadgeCount = (count) => {
  return notificationSystem.updateBadge(count);
};

export const checkPendingReminders = (userId) => {
  return notificationSystem.checkPendingReminders(userId);
};