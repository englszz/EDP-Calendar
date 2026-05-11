const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const { defineString } = require("firebase-functions/params");

admin.initializeApp();
const db = admin.firestore();
const resendKey = defineString("RESEND_KEY");

exports.sendEventNotifications = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "America/Santo_Domingo",
  },
  async () => {
    const resend = new Resend(resendKey.value());

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    const snapshot = await db.collection("tasks")
      .where("dueDate", "==", dateStr)
      .where("reminderTime", "==", timeStr)
      .where("completed", "==", false)
      .where("reminderSent", "==", false)
      .get();

    const promises = snapshot.docs.map(async (doc) => {
      const task = doc.data();
      const user = await admin.auth().getUser(task.uid);
      const email = user.email;

      await resend.emails.send({
        from: "EDP Calendar <onboarding@resend.dev>",
        to: email,
        subject: `Recordatorio: ${task.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #e2e8f0; padding: 32px; border: 1px solid #222;">
            <h2 style="color: white; margin-bottom: 8px;">Recordatorio</h2>
            <p style="color: #94a3b8; margin-bottom: 24px;">Tienes una tarea pendiente:</p>
            <div style="background: #111; border: 1px solid #222; padding: 16px; margin-bottom: 24px;">
              <p style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 8px;">${task.title}</p>
              ${task.description ? `<p style="color: #64748b; font-size: 14px; margin: 0;">${task.description}</p>` : ""}
            </div>
            <p style="color: #64748b; font-size: 12px;">EDP Calendar</p>
          </div>
        `,
      });

      await doc.ref.update({ reminderSent: true });
    });

    await Promise.all(promises);
  }
);