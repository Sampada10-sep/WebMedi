import { useEffect, useState } from "react";

function MedicineNotification() {
  const [medicines, setMedicines] = useState([]);
  const [showPermissionBox, setShowPermissionBox] =
    useState(() => {
      if (!("Notification" in window)) {
        return false;
      }

      const dismissed = localStorage.getItem(
        "notification_prompt_dismissed"
      );

      return (
        Notification.permission === "default" &&
        dismissed !== "true"
      );
    });

  const [permissionMessage, setPermissionMessage] =
    useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadMedicines() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/medicines",
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message || "Failed to load medicines."
          );
          return;
        }

        const currentUserId =
          localStorage.getItem("user_id");

        const allMedicines = Array.isArray(data)
          ? data
          : data.medicines || [];

        const currentUserMedicines =
          allMedicines.filter(
            (medicine) =>
              !currentUserId ||
              !medicine.user_id ||
              String(medicine.user_id) ===
                String(currentUserId)
          );

        setMedicines(currentUserMedicines);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Notification fetch error:",
            error
          );
        }
      }
    }

    loadMedicines();

    const fetchInterval = window.setInterval(
      loadMedicines,
      60000
    );

    return () => {
      controller.abort();
      window.clearInterval(fetchInterval);
    };
  }, []);

  useEffect(() => {
    if (
      !("Notification" in window) ||
      Notification.permission !== "granted" ||
      medicines.length === 0
    ) {
      return undefined;
    }

    function checkMedicineReminders() {
      const now = new Date();

      const currentHours = String(
        now.getHours()
      ).padStart(2, "0");

      const currentMinutes = String(
        now.getMinutes()
      ).padStart(2, "0");

      const currentTime = `${currentHours}:${currentMinutes}`;

      const currentDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-");

      medicines.forEach((medicine) => {
        const status = String(
          medicine.status || "Active"
        ).toLowerCase();

        if (status !== "active") {
          return;
        }

        const reminderTime = String(
          medicine.reminder_time || ""
        ).slice(0, 5);

        if (!reminderTime) {
          return;
        }

        const startDate = medicine.start_date
          ? String(medicine.start_date).split("T")[0]
          : "";

        const endDate = medicine.end_date
          ? String(medicine.end_date).split("T")[0]
          : "";

        const medicineHasStarted =
          !startDate || currentDate >= startDate;

        const medicineHasNotEnded =
          !endDate || currentDate <= endDate;

        const isReminderTime =
          reminderTime === currentTime;

        if (
          !medicineHasStarted ||
          !medicineHasNotEnded ||
          !isReminderTime
        ) {
          return;
        }

        const medicineId =
          medicine.id ||
          medicine.medicine_id ||
          medicine.medicine_name;

        const notificationKey = [
          "medicine_notification",
          medicineId,
          currentDate,
          reminderTime,
        ].join("_");

        const notificationAlreadySent =
          localStorage.getItem(notificationKey);

        if (notificationAlreadySent === "true") {
          return;
        }

        const medicineName =
          medicine.medicine_name ||
          "Your medicine";

        const dosage =
          medicine.dosage ||
          "Take your scheduled dose";

        const notification = new Notification(
          "Medicine Reminder",
          {
            body: `${medicineName} - ${dosage}`,
            icon: "/vite.svg",
            tag: String(medicineId),
            requireInteraction: true,
          }
        );

        notification.onclick = () => {
          window.focus();
          window.location.href = "/my-medicines";
          notification.close();
        };

        localStorage.setItem(
          notificationKey,
          "true"
        );
      });
    }

    checkMedicineReminders();

    const reminderInterval = window.setInterval(
      checkMedicineReminders,
      30000
    );

    return () => {
      window.clearInterval(reminderInterval);
    };
  }, [medicines]);

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      setPermissionMessage(
        "Your browser does not support notifications."
      );
      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      if (permission === "granted") {
        setPermissionMessage(
          "Medicine notifications are enabled."
        );

        window.setTimeout(() => {
          setShowPermissionBox(false);
          setPermissionMessage("");
        }, 1500);
      } else if (permission === "denied") {
        setPermissionMessage(
          "Notifications were blocked. You can enable them from your browser settings."
        );
      } else {
        setPermissionMessage(
          "Notification permission was not enabled."
        );
      }
    } catch (error) {
      console.error(
        "Notification permission error:",
        error
      );

      setPermissionMessage(
        "Unable to enable notifications."
      );
    }
  };

  const handleDismissPermission = () => {
    localStorage.setItem(
      "notification_prompt_dismissed",
      "true"
    );

    setShowPermissionBox(false);
    setPermissionMessage("");
  };

  if (!showPermissionBox) {
    return null;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.permissionBox}>
        <div style={styles.icon}>🔔</div>

        <h2 style={styles.title}>
          Enable Medicine Reminders
        </h2>

        <p style={styles.text}>
          Allow notifications so MediReminder can alert
          you when it is time to take your medicine.
        </p>

        {permissionMessage && (
          <div style={styles.message}>
            {permissionMessage}
          </div>
        )}

        <div style={styles.buttons}>
          <button
            type="button"
            style={styles.notNowButton}
            onClick={handleDismissPermission}
          >
            Not Now
          </button>

          <button
            type="button"
            style={styles.enableButton}
            onClick={handleEnableNotifications}
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    fontFamily: "Arial, sans-serif",
  },

  permissionBox: {
    width: "100%",
    maxWidth: "430px",
    padding: "32px",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    textAlign: "center",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.25)",
  },

  icon: {
    width: "70px",
    height: "70px",
    margin: "0 auto 18px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ede9fe",
    fontSize: "34px",
  },

  title: {
    margin: "0 0 12px",
    color: "#1f2937",
    fontSize: "25px",
  },

  text: {
    margin: "0 0 22px",
    color: "#6b7280",
    fontSize: "15px",
    lineHeight: "1.6",
  },

  message: {
    marginBottom: "20px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    fontSize: "14px",
    fontWeight: "bold",
  },

  buttons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  notNowButton: {
    flex: 1,
    minWidth: "130px",
    padding: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: "bold",
  },

  enableButton: {
    flex: 1,
    minWidth: "180px",
    padding: "13px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default MedicineNotification;