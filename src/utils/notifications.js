import { getToken, onMessage } from 'firebase/messaging';
import { messagingPromise } from '../config/firebase';

const VAPID_KEY = 'BE36k2GMvRYdOFUXh9UrTVki4fG0dSTwsYeifw4tERSNYPe3Vwf_uShEkUNL7i0UehZhcfzsEf19Af8Frs2cOnY';

// Detectar plataforma
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// Sistema híbrido de notificaciones
class NotificationSystem {
  constructor() {
    this.platform = this.detectPlatform();
    this.token = null;
    this.scheduledReminders = new Map();
  }

  detectPlatform() {
    if (isIOS()) return 'ios';
    if (isAndroid()) return 'android';
    return 'desktop';
  }

  // Solicitar permisos según plataforma
  async requestPermission() {
    console.log(`🔔 Solicitando permisos en ${this.platform}`);

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('❌ Permiso denegado');
        return null;
      }

      // iOS: solo usa Notification API local
      if (this.platform === 'ios') {
        console.log('✅ iOS: Usando notificaciones locales');
        return 'ios-local';
      }

      // Android/Desktop: intenta FCM
      const messaging = await messagingPromise;
      if (!messaging) {
        console.log('⚠️ FCM no disponible, usando notificaciones locales');
        return 'local';
      }

      // Registrar Service Worker
      let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!registration) {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service Worker registrado');
      }

      await navigator.serviceWorker.ready;

      // Obtener token FCM
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      this.token = token;
      console.log('✅ FCM Token obtenido:', token);

      // Escuchar mensajes en foreground
      onMessage(messaging, (payload) => {
        console.log('📬 Mensaje recibido:', payload);
        this.showLocalNotification(
          payload.notification?.title || 'EDP Calendar',
          payload.notification?.body || 'Tienes una notificación',
          payload.data
        );
      });

      return token;

    } catch (error) {
      console.error('❌ Error en permisos:', error);
      return null;
    }
  }

  // Mostrar notificación local (funciona en iOS y todos)
  showLocalNotification(title, body, data = {}) {
    if (Notification.permission !== 'granted') {
      console.log('⚠️ No hay permiso para notificaciones');
      return;
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
        if (data.url) {
          window.location.href = data.url;
        }
      };

      console.log('✅ Notificación local mostrada');
      return notification;
    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
      return null;
    }
  }

  // Programar recordatorio
  scheduleReminder(task, minutesBefore = 30) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const reminderTime = new Date(dueDate.getTime() - minutesBefore * 60000);
    const delay = reminderTime.getTime() - now.getTime();

    if (delay <= 0) {
      console.log('⏰ La tarea ya pasó o es muy pronto');
      return null;
    }

    // Cancelar recordatorio anterior si existe
    if (this.scheduledReminders.has(task.id)) {
      clearTimeout(this.scheduledReminders.get(task.id));
    }

    const timeoutId = setTimeout(() => {
      this.showLocalNotification(
        `⏰ Recordatorio: ${task.title}`,
        `Vence en ${minutesBefore} minutos`,
        { taskId: task.id, url: '/' }
      );
      this.scheduledReminders.delete(task.id);
    }, delay);

    this.scheduledReminders.set(task.id, timeoutId);
    console.log(`⏰ Recordatorio programado para ${reminderTime.toLocaleString()}`);
    return timeoutId;
  }

  // Cancelar recordatorio
  cancelReminder(taskId) {
    if (this.scheduledReminders.has(taskId)) {
      clearTimeout(this.scheduledReminders.get(taskId));
      this.scheduledReminders.delete(taskId);
      console.log(`⏰ Recordatorio cancelado para tarea ${taskId}`);
    }
  }

  // Generar link para calendario de iOS
  generateCalendarLink(task) {
    const startDate = new Date(task.dueDate);
    const endDate = new Date(startDate.getTime() + 60 * 60000); // +1 hora

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
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

  // Agregar al calendario nativo (iOS)
  addToNativeCalendar(task) {
    const calendarUrl = this.generateCalendarLink(task);
    const link = document.createElement('a');
    link.href = calendarUrl;
    link.download = `${task.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('📅 Evento descargado para calendario');
  }

  // Actualizar badge del ícono PWA
  updateBadge(count) {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count);
      } else {
        navigator.clearAppBadge();
      }
      console.log(`🔢 Badge actualizado: ${count}`);
    }
  }
}

// Exportar instancia única
export const notificationSystem = new NotificationSystem();

// Mantener la función original para compatibilidad
export const requestNotificationPermission = async () => {
  return await notificationSystem.requestPermission();
};

// Nuevas funciones para usar en componentes
export const showNotification = (title, body, data) => {
  return notificationSystem.showLocalNotification(title, body, data);
};

export const scheduleTaskReminder = (task, minutesBefore = 30) => {
  return notificationSystem.scheduleReminder(task, minutesBefore);
};

export const cancelTaskReminder = (taskId) => {
  return notificationSystem.cancelReminder(taskId);
};

export const addTaskToCalendar = (task) => {
  return notificationSystem.addToNativeCalendar(task);
};

export const updateBadgeCount = (count) => {
  return notificationSystem.updateBadge(count);
};