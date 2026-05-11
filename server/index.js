const express = require("express");
const cron = require("node-cron");
const admin = require("firebase-admin");
const { Resend } = require("resend");

const app = express();
const resend = new Resend(process.env.RESEND_KEY);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Health check
app.get("/", (req, res) => res.send("EDP Calendar server running"));

// Run every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    // Adjust to RD time (UTC-4)
    now.setHours(now.getHours() - 4);
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    console.log(`Checking reminders for ${dateStr} at ${timeStr}`);

    const snapshot = await db.collection("tasks")
      .where("dueDate", "==", dateStr)
      .where("reminderTime", "==", timeStr)
      .where("completed", "==", false)
      .where("reminderSent", "==", false)
      .get();

    console.log(`Found ${snapshot.docs.length} reminders to send`);

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
      console.log(`Reminder sent to ${email} for task: ${task.title}`);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));