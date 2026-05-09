const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// Función HTTP (funciona en plan Spark)
exports.sendEventNotifications = functions.https.onRequest(async (req, res) => {
  
  const now = admin.firestore.Timestamp.now();
  const next10Minutes = new Date(now.toDate().getTime() + 10 * 60 * 1000);

  console.log(`🔍 Buscando eventos para notificar...`);

  try {
    const snapshot = await db.collection("events")
      .where("start", ">=", now)
      .where("start", "<=", next10Minutes)
      .where("notified", "==", false)
      .get();

    if (snapshot.empty) {
      console.log("✅ No hay eventos");
      return res.status(200).send("No events");
    }

    const promises = snapshot.docs.map(async (doc) => {
      const event = doc.data();
      const eventTime = event.start.toDate ? event.start.toDate() : new Date(event.start);
      
      const minutesLeft = Math.round((eventTime - now.toDate()) / 60000);

      if (minutesLeft <= 0) return;

      const userDoc = await db.collection("users").doc(event.userId).get();
      const token = userDoc.data()?.fcmToken;

      if (!token) return;

      await sendPushNotification(token, event);

      await doc.ref.update({ notified: true });
      
      console.log(`✅ Notificación enviada: ${event.title}`);
    });

    await Promise.all(promises);
    res.status(200).send("Notificaciones procesadas");

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).send("Error");
  }
});

async function sendPushNotification(token, event) {
  const payload = {
    token: token,
    notification: {
      title: "🔔 Recordatorio - EDP Calendar",
      body: `${event.title} comienza en pocos minutos`
    },
    webpush: {
      fcmOptions: { link: "https://edp-calendar.vercel.app/" }
    }
  };

  try {
    await admin.messaging().send(payload);
  } catch (error) {
    console.error("Error push:", error);
  }
}