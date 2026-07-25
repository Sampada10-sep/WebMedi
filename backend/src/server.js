const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const webpush = require("web-push");
const cron = require("node-cron");

dotenv.config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);

// ========================================
// WEB PUSH CONFIGURATION
// ========================================

if (
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_EMAIL
) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  console.log("✅ Web Push VAPID configured");
} else {
  console.log("❌ VAPID keys are missing from .env");
}

// ========================================
// GET VAPID PUBLIC KEY
// ========================================

app.get("/api/push/public-key", (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(500).json({
      message: "VAPID public key is not configured",
    });
  }

  res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
});

// ========================================
// SAVE PUSH SUBSCRIPTION TO POSTGRESQL
// ========================================

app.post("/api/push/subscribe", async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (
      !subscription ||
      !subscription.endpoint ||
      !subscription.keys ||
      !subscription.keys.p256dh ||
      !subscription.keys.auth
    ) {
      return res.status(400).json({
        message: "Valid push subscription required",
      });
    }

    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys.p256dh;
    const auth = subscription.keys.auth;

    // Save new subscription or update an existing endpoint.
    await pool.query(
      `
      INSERT INTO push_subscriptions
        (user_id, endpoint, p256dh, auth)
      VALUES
        ($1, $2, $3, $4)

      ON CONFLICT (endpoint)

      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth
      `,
      [userId, endpoint, p256dh, auth]
    );

    console.log(
      `✅ Push subscription saved permanently for user ${userId}`
    );

    res.status(201).json({
      message:
        "Push subscription saved permanently",
    });
  } catch (error) {
    console.error(
      "❌ Save subscription error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to save push subscription",
      error: error.message,
    });
  }
});

// ========================================
// REMOVE PUSH SUBSCRIPTION
// ========================================

app.post(
  "/api/push/unsubscribe",
  async (req, res) => {
    try {
      const { endpoint, userId } = req.body;

      if (endpoint) {
        await pool.query(
          `
          DELETE FROM push_subscriptions
          WHERE endpoint = $1
          `,
          [endpoint]
        );
      } else if (userId) {
        await pool.query(
          `
          DELETE FROM push_subscriptions
          WHERE user_id = $1
          `,
          [userId]
        );
      }

      console.log(
        `🔕 Push subscription removed${
          userId ? ` for user ${userId}` : ""
        }`
      );

      res.json({
        message:
          "Push subscription removed",
      });
    } catch (error) {
      console.error(
        "❌ Unsubscribe error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to remove subscription",
        error: error.message,
      });
    }
  }
);

// ========================================
// TEST PUSH NOTIFICATION
// ========================================

app.post(
  "/api/push/test",
  async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          message: "User ID is required",
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM push_subscriptions
        WHERE user_id = $1
        `,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message:
            "No push subscription found. Turn notifications on first.",
        });
      }

      const payload = JSON.stringify({
        title: "💊 MediReminder",

        body:
          "Background push notifications are working!",

        tag: `test-${Date.now()}`,

        url: "/dashboard",
      });

      let sent = 0;
      let failed = 0;

      for (const row of result.rows) {
        const subscription = {
          endpoint: row.endpoint,

          keys: {
            p256dh: row.p256dh,
            auth: row.auth,
          },
        };

        try {
          await webpush.sendNotification(
            subscription,
            payload
          );

          sent++;
        } catch (error) {
          failed++;

          console.error(
            "❌ Test push failed:",
            error.message
          );

          // Remove expired browser subscriptions.
          if (
            error.statusCode === 404 ||
            error.statusCode === 410
          ) {
            await pool.query(
              `
              DELETE FROM push_subscriptions
              WHERE id = $1
              `,
              [row.id]
            );

            console.log(
              "🗑️ Expired push subscription removed"
            );
          }
        }
      }

      res.json({
        message: "Test push completed",
        sent,
        failed,
      });
    } catch (error) {
      console.error(
        "❌ Test push error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to send test push",
        error: error.message,
      });
    }
  }
);

// ========================================
// AUTOMATIC MEDICINE REMINDER
// ========================================

// Prevent duplicate reminders while this server
// process is running.
const sentReminders = new Set();

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const currentDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    const currentTime = [
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
    ].join(":");

    console.log(
      `⏰ Checking reminders: ${currentDate} ${currentTime}`
    );

    // Get active medicines.
    const medicineResult = await pool.query(`
      SELECT *
      FROM medicines
      WHERE LOWER(
        COALESCE(status, 'active')
      ) = 'active'
    `);

    const medicines = medicineResult.rows;

    for (const medicine of medicines) {
      if (!medicine.reminder_time) {
        continue;
      }

      const reminderTime = String(
        medicine.reminder_time
      ).substring(0, 5);

      // ========================================
      // CHECK START AND END DATE
      // ========================================

      let startDate = null;
      let endDate = null;

      if (medicine.start_date) {
        startDate = new Date(
          medicine.start_date
        )
          .toISOString()
          .split("T")[0];
      }

      if (medicine.end_date) {
        endDate = new Date(
          medicine.end_date
        )
          .toISOString()
          .split("T")[0];
      }

      if (
        startDate &&
        currentDate < startDate
      ) {
        continue;
      }

      if (
        endDate &&
        currentDate > endDate
      ) {
        continue;
      }

      // ========================================
      // CHECK MEDICINE TIME
      // ========================================

      const [
        reminderHour,
        reminderMinute,
      ] = reminderTime
        .split(":")
        .map(Number);

      const reminderDateTime =
        new Date(now);

      reminderDateTime.setHours(
        reminderHour,
        reminderMinute,
        0,
        0
      );

      const differenceInMinutes =
        (now.getTime() -
          reminderDateTime.getTime()) /
        60000;

      // Allow up to 2 minutes late.
      if (
        differenceInMinutes < 0 ||
        differenceInMinutes > 2
      ) {
        continue;
      }

      // Use the scheduled medicine time in the
      // key, not currentTime. This prevents the
      // same medicine from being sent again at
      // +1 and +2 minutes.
      const reminderKey =
        `${medicine.id}-${currentDate}-${reminderTime}`;

      if (
        sentReminders.has(reminderKey)
      ) {
        continue;
      }

      // ========================================
      // GET USER'S SAVED PUSH SUBSCRIPTIONS
      // ========================================

      const subscriptionResult =
        await pool.query(
          `
          SELECT *
          FROM push_subscriptions
          WHERE user_id = $1
          `,
          [medicine.user_id]
        );

      if (
        subscriptionResult.rows.length === 0
      ) {
        console.log(
          `⚠️ No saved push subscription for user ${medicine.user_id}`
        );

        continue;
      }

      const payload = JSON.stringify({
        title:
          "💊 Medicine Reminder",

        body: `Time to take ${
          medicine.medicine_name ||
          "your medicine"
        } — ${
          medicine.dosage ||
          "Dosage not specified"
        }`,

        tag: reminderKey,

        url: "/dashboard",
      });

      let atLeastOneSent = false;

      // Send to every browser/device registered
      // by this user.
      for (
        const row of subscriptionResult.rows
      ) {
        const subscription = {
          endpoint: row.endpoint,

          keys: {
            p256dh: row.p256dh,
            auth: row.auth,
          },
        };

        try {
          await webpush.sendNotification(
            subscription,
            payload
          );

          atLeastOneSent = true;

          console.log(
            `✅ Reminder sent: ${medicine.medicine_name} to user ${medicine.user_id}`
          );
        } catch (error) {
          console.error(
            `❌ Reminder failed for ${medicine.medicine_name}:`,
            error.message
          );

          // Subscription no longer exists in
          // the browser/push service.
          if (
            error.statusCode === 404 ||
            error.statusCode === 410
          ) {
            await pool.query(
              `
              DELETE FROM push_subscriptions
              WHERE id = $1
              `,
              [row.id]
            );

            console.log(
              `🗑️ Expired subscription removed for user ${medicine.user_id}`
            );
          }
        }
      }

      if (atLeastOneSent) {
        sentReminders.add(
          reminderKey
        );
      }
    }

    // Prevent memory from growing forever.
    if (sentReminders.size > 1000) {
      sentReminders.clear();
    }
  } catch (error) {
    console.error(
      "❌ Reminder scheduler error:",
      error.message
    );
  }
});

// ========================================
// EXISTING ROUTES
// ========================================

app.get("/", (req, res) => {
  res.json({
    message:
      "MediReminder backend is running",
  });
});

app.get(
  "/api/test-database",
  async (req, res) => {
    try {
      const result =
        await pool.query(
          "SELECT NOW()"
        );

      res.status(200).json({
        message:
          "Database connected successfully",
        time: result.rows[0].now,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Database connection failed",
        error: error.message,
      });
    }
  }
);

// ========================================
// START SERVER
// ========================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server is running on http://localhost:${PORT}`
  );
});