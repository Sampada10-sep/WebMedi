import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "../context/ThemeContext";

import {
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPush,
} from "../pushNotifications";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [notificationPermission, setNotificationPermission] =
    useState(
      typeof Notification === "undefined"
        ? "unsupported"
        : Notification.permission
    );

  const notifiedMedicines = useRef(new Set());

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("medicine_notifications") !== "off"
  );

  const [dueMedicine, setDueMedicine] = useState(null);
  const snoozeTimerRef = useRef(null);

  const userName =
    localStorage.getItem("user_name") || "User";

  const colors = {
    page: isDark ? "#0f172a" : "#f4f7fb",
    navbar: isDark ? "#1e293b" : "#ffffff",
    card: isDark ? "#1e293b" : "#ffffff",
    cardSecondary: isDark ? "#273449" : "#f9fafb",
    text: isDark ? "#f8fafc" : "#1f2937",
    mutedText: isDark ? "#cbd5e1" : "#6b7280",
    lightText: isDark ? "#94a3b8" : "#9ca3af",
    border: isDark ? "#334155" : "#f1f5f9",
    buttonBackground: isDark ? "#334155" : "#ffffff",

    shadow: isDark
      ? "0 7px 22px rgba(0, 0, 0, 0.3)"
      : "0 7px 22px rgba(0, 0, 0, 0.07)",
  };

  const loadMedicines = useCallback(async (signal) => {
    try {
      const response = await fetch(
        "https://medireminder-backend-un9x.onrender.com/api/medicines",
        {
          signal,
          cache: "no-store",
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load medicines."
        );
      }

      const currentUserId = localStorage.getItem("user_id");
      const allMedicines = Array.isArray(data)
        ? data
        : data.medicines || [];

      const currentUserMedicines = allMedicines.filter(
        (medicine) =>
          !currentUserId ||
          !medicine.user_id ||
          String(medicine.user_id) === String(currentUserId)
      );

      setMedicines(currentUserMedicines);
      setMessage("");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Dashboard fetch error:", error);
        setMessage(
          error.message || "Cannot connect to the backend."
        );
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
  const controller = new AbortController();

  const initialLoadId = window.setTimeout(() => {
    void loadMedicines(controller.signal);
  }, 0);

  const medicinePollId = window.setInterval(() => {
    void loadMedicines();
  }, 15000);

  const refreshOnFocus = () => {
    void loadMedicines();
  };

  window.addEventListener("focus", refreshOnFocus);

  return () => {
    controller.abort();
    window.clearTimeout(initialLoadId);
    window.clearInterval(medicinePollId);
    window.removeEventListener("focus", refreshOnFocus);
  };
}, [loadMedicines]);
  const toggleNotifications = async () => {
    try {
      if (notificationsEnabled) {
        await unsubscribeFromPush();

        setNotificationsEnabled(false);
        localStorage.setItem("medicine_notifications", "off");
        setDueMedicine(null);

        if (snoozeTimerRef.current) {
          window.clearTimeout(snoozeTimerRef.current);
          snoozeTimerRef.current = null;
        }

        setMessage("🔕 Medicine notifications turned off.");

        window.setTimeout(() => {
          setMessage("");
        }, 3000);

        return;
      }

      if (!("Notification" in window)) {
        setMessage(
          "Your browser does not support notifications."
        );
        return;
      }

      let permission = Notification.permission;

      if (permission !== "granted") {
        permission = await Notification.requestPermission();
      }

      setNotificationPermission(permission);

      if (permission !== "granted") {
        setMessage(
          "Please allow notifications in your browser."
        );
        return;
      }

      await subscribeToPush();

      setNotificationsEnabled(true);
      localStorage.setItem("medicine_notifications", "on");

      setMessage(
        "🔔 Push notifications turned on successfully."
      );

      window.setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (error) {
      console.error("Push notification error:", error);

      setMessage(
        error.message ||
          "Could not enable push notifications."
      );
    }
  };

  useEffect(() => {
    if (!("Notification" in window)) {
      return undefined;
    }

    const parseReminderTime = (timeValue) => {
      if (!timeValue) return null;

      const value = String(timeValue).trim();
      const twelveHourMatch = value.match(
        /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i
      );

      let hours;
      let minutes;

      if (twelveHourMatch) {
        hours = Number(twelveHourMatch[1]);
        minutes = Number(twelveHourMatch[2]);
        const period = twelveHourMatch[3].toUpperCase();

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
      } else {
        const parts = value.split(":");
        hours = Number(parts[0]);
        minutes = Number(parts[1]);
      }

      if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        return null;
      }

      return { hours, minutes };
    };

    const getLocalDateString = (date) =>
      [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

    const checkMedicineReminders = () => {
      if (!notificationsEnabled) return;

      const now = new Date();
      const currentDate = getLocalDateString(now);

      medicines.forEach((medicine) => {
        const status = String(
          medicine.status || "Active"
        ).toLowerCase();

        const startDate = medicine.start_date
          ? String(medicine.start_date).split("T")[0]
          : "";

        const endDate = medicine.end_date
          ? String(medicine.end_date).split("T")[0]
          : "";

        const isScheduledToday =
          (!startDate || startDate <= currentDate) &&
          (!endDate || endDate >= currentDate);

        if (status !== "active" || !isScheduledToday) return;

        const parsedTime = parseReminderTime(
          medicine.reminder_time
        );

        if (!parsedTime) return;

        const reminderDate = new Date(now);
        reminderDate.setHours(
          parsedTime.hours,
          parsedTime.minutes,
          0,
          0
        );

        const differenceInMinutes =
          (now.getTime() - reminderDate.getTime()) / 60000;

        // Notify at the scheduled time or up to 5 minutes late.
        if (differenceInMinutes < 0 || differenceInMinutes > 5) {
          return;
        }

        const notificationKey = `${
          medicine.id
        }-${currentDate}-${parsedTime.hours}:${parsedTime.minutes}`;

        if (notifiedMedicines.current.has(notificationKey)) {
          return;
        }

        // Show an in-app reminder while MediReminder is open.
        setDueMedicine(medicine);

        // Also show a browser notification when permission is granted.
        if (
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          const notification = new Notification(
            "💊 Medicine Reminder",
            {
              body: `${
                medicine.medicine_name || "Medicine"
              } — ${
                medicine.dosage || "Dosage not provided"
              }`,
              tag: notificationKey,
              requireInteraction: true,
            }
          );

          notification.onclick = () => {
            window.focus();
            navigate("/medicines");
            notification.close();
          };
        }

        notifiedMedicines.current.add(notificationKey);
      });
    };

    checkMedicineReminders();

    const reminderIntervalId = window.setInterval(
      checkMedicineReminders,
      10000
    );

    const checkOnFocus = () => checkMedicineReminders();
    window.addEventListener("focus", checkOnFocus);

    return () => {
      window.clearInterval(reminderIntervalId);
      window.removeEventListener("focus", checkOnFocus);
    };
  }, [medicines, navigate, notificationsEnabled]);

  const markReminderTaken = () => {
    setDueMedicine(null);
    setMessage("✅ Medicine marked as taken.");

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const snoozeReminder = () => {
    if (!dueMedicine) return;

    const medicineToSnooze = dueMedicine;
    setDueMedicine(null);
    setMessage("⏰ Reminder snoozed for 10 minutes.");

    if (snoozeTimerRef.current) {
      window.clearTimeout(snoozeTimerRef.current);
    }

    snoozeTimerRef.current = window.setTimeout(() => {
      if (
        localStorage.getItem("medicine_notifications") !== "off"
      ) {
        setDueMedicine(medicineToSnooze);

        if (
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("💊 Snoozed Medicine Reminder", {
            body: `${
              medicineToSnooze.medicine_name || "Medicine"
            } — ${
              medicineToSnooze.dosage || "Dosage not provided"
            }`,
            requireInteraction: true,
          });
        }
      }
    }, 10 * 60 * 1000);

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const sendTestNotification = async () => {
    try {
      setMessage(
        "Sending background test notification..."
      );

      const result = await sendTestPush();

      console.log("Push test result:", result);

      setMessage(
        "✅ Background push notification sent."
      );

      window.setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Test push error:", error);

      setMessage(
        error.message ||
          "Failed to send test push notification."
      );
    }
  };

  const totalMedicines = medicines.length;

  const activeMedicines = medicines.filter(
    (medicine) =>
      String(
        medicine.status || "Active"
      ).toLowerCase() === "active"
  ).length;

  const completedMedicines = medicines.filter(
    (medicine) =>
      String(
        medicine.status || ""
      ).toLowerCase() === "completed"
  ).length;

  const todayString = useMemo(() => {
    const today = new Date();

    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(
        2,
        "0"
      ),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
  }, []);

  const todaysReminders = useMemo(() => {
    return medicines
      .filter((medicine) => {
        const status = String(
          medicine.status || "Active"
        ).toLowerCase();

        if (status !== "active") {
          return false;
        }

        const startDate = medicine.start_date
          ? String(medicine.start_date).split(
              "T"
            )[0]
          : "";

        const endDate = medicine.end_date
          ? String(medicine.end_date).split(
              "T"
            )[0]
          : "";

        const hasStarted =
          !startDate ||
          startDate <= todayString;

        const hasNotEnded =
          !endDate ||
          endDate >= todayString;

        return hasStarted && hasNotEnded;
      })
      .sort(
        (firstMedicine, secondMedicine) =>
          String(
            firstMedicine.reminder_time || ""
          ).localeCompare(
            String(
              secondMedicine.reminder_time || ""
            )
          )
      );
  }, [medicines, todayString]);

  const chartData = {
    labels: ["Active", "Completed"],

    datasets: [
      {
        label: "Medicines",

        data: [
          activeMedicines,
          completedMedicines,
        ],

        backgroundColor: [
          "#22c55e",
          "#3b82f6",
        ],

        borderColor: [
          isDark ? "#1e293b" : "#ffffff",
          isDark ? "#1e293b" : "#ffffff",
        ],

        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          padding: 20,
          usePointStyle: true,
          color: colors.text,

          font: {
            size: 14,
            weight: "bold",
          },
        },
      },

      tooltip: {
        callbacks: {
          label(context) {
            return `${context.label}: ${context.raw}`;
          },
        },
      },
    },
  };
  const formatTime = (timeValue) => {
    if (!timeValue) {
      return "No time set";
    }

    const [hours, minutes] =
      String(timeValue).split(":");

    if (
      Number.isNaN(Number(hours)) ||
      Number.isNaN(Number(minutes))
    ) {
      return String(timeValue);
    }

    const timeDate = new Date();

    timeDate.setHours(Number(hours));
    timeDate.setMinutes(Number(minutes));
    timeDate.setSeconds(0);

    return timeDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("profile_image");

    navigate("/login");
    window.location.reload();
  };

  return (
    <div
      style={{
        ...styles.page,
        backgroundColor: colors.page,
        color: colors.text,
      }}
    >
      <nav
        style={{
          ...styles.navbar,
          backgroundColor: colors.navbar,
          boxShadow: colors.shadow,
        }}
      >
        <h2 style={styles.logo}>
          MediReminder
        </h2>

        <div style={styles.navButtons}>
          <button
            type="button"
            style={{
              ...styles.notificationToggle,
              backgroundColor: notificationsEnabled
                ? "#16a34a"
                : "#94a3b8",
            }}
            onClick={toggleNotifications}
            aria-pressed={notificationsEnabled}
          >
            <span
              style={{
                ...styles.toggleTrack,
                backgroundColor: notificationsEnabled
                  ? "#bbf7d0"
                  : "#e5e7eb",
              }}
            >
              <span
                style={{
                  ...styles.toggleKnob,
                  transform: notificationsEnabled
                    ? "translateX(18px)"
                    : "translateX(0)",
                }}
              />
            </span>

            {notificationsEnabled
              ? "🔔 Notifications ON"
              : "🔕 Notifications OFF"}
          </button>

          {notificationsEnabled &&
            notificationPermission === "granted" && (
              <button
                type="button"
                style={styles.testNotificationButton}
                onClick={sendTestNotification}
              >
                Test Notification
              </button>
            )}

          <button
            type="button"
            style={{
              ...styles.profileButton,
              backgroundColor:
                colors.buttonBackground,
            }}
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>

          <button
            type="button"
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={styles.container}>
        {notificationsEnabled && dueMedicine && (
          <div
            style={{
              ...styles.reminderPopup,
              backgroundColor: colors.card,
              color: colors.text,
              boxShadow: colors.shadow,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={styles.reminderPopupHeader}>
              <div style={styles.reminderPopupIcon}>💊</div>

              <div>
                <h3 style={styles.reminderPopupTitle}>
                  Medicine Reminder
                </h3>

                <p
                  style={{
                    ...styles.reminderPopupSubtitle,
                    color: colors.mutedText,
                  }}
                >
                  It&apos;s time to take your medicine.
                </p>
              </div>
            </div>

            <div
              style={{
                ...styles.reminderPopupMedicine,
                backgroundColor: colors.cardSecondary,
                border: `1px solid ${colors.border}`,
              }}
            >
              <strong>
                {dueMedicine.medicine_name || "Medicine"}
              </strong>

              <span style={{ color: colors.mutedText }}>
                {dueMedicine.dosage || "Dosage not provided"}
              </span>

              <span style={styles.reminderPopupTime}>
                {formatTime(dueMedicine.reminder_time)}
              </span>
            </div>

            <div style={styles.reminderPopupActions}>
              <button
                type="button"
                style={styles.takenButton}
                onClick={markReminderTaken}
              >
                ✓ Taken
              </button>

              <button
                type="button"
                style={styles.snoozeButton}
                onClick={snoozeReminder}
              >
                ⏰ Snooze 10 min
              </button>
            </div>
          </div>
        )}

        <section style={styles.welcomeSection}>
          <div>
            <p style={styles.welcomeLabel}>
              Welcome back
            </p>

            <h1 style={styles.welcomeTitle}>
              Hello, {userName}!
            </h1>

            <p style={styles.welcomeText}>
              Manage your medicines and never miss a
              reminder.
            </p>
          </div>

          <div style={styles.welcomeButtons}>
            <button
              type="button"
              style={styles.addMedicineButton}
              onClick={() =>
                navigate("/add-medicine")
              }
            >
              + Add Medicine
            </button>

            <button
              type="button"
              style={styles.viewMedicineButton}
              onClick={() =>
                navigate("/medicines")
              }
            >
              View Medicines
            </button>
          </div>
        </section>

        {message && (
          <div style={styles.messageBox}>
            {message}
          </div>
        )}

        <section style={styles.statisticsGrid}>
          <div
            style={{
              ...styles.statCard,
              backgroundColor: colors.card,
              boxShadow: colors.shadow,
            }}
          >
            <div style={styles.totalIcon}>
              💊
            </div>

            <div>
              <p
                style={{
                  ...styles.statLabel,
                  color: colors.mutedText,
                }}
              >
                Total Medicines
              </p>

              <h2
                style={{
                  ...styles.statNumber,
                  color: colors.text,
                }}
              >
                {isLoading
                  ? "..."
                  : totalMedicines}
              </h2>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              backgroundColor: colors.card,
              boxShadow: colors.shadow,
            }}
          >
            <div style={styles.reminderIcon}>
              ⏰
            </div>

            <div>
              <p
                style={{
                  ...styles.statLabel,
                  color: colors.mutedText,
                }}
              >
                Today&apos;s Reminders
              </p>

              <h2
                style={{
                  ...styles.statNumber,
                  color: colors.text,
                }}
              >
                {isLoading
                  ? "..."
                  : todaysReminders.length}
              </h2>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              backgroundColor: colors.card,
              boxShadow: colors.shadow,
            }}
          >
            <div style={styles.activeIcon}>
              ✓
            </div>

            <div>
              <p
                style={{
                  ...styles.statLabel,
                  color: colors.mutedText,
                }}
              >
                Active Medicines
              </p>

              <h2
                style={{
                  ...styles.statNumber,
                  color: colors.text,
                }}
              >
                {isLoading
                  ? "..."
                  : activeMedicines}
              </h2>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              backgroundColor: colors.card,
              boxShadow: colors.shadow,
            }}
          >
            <div style={styles.completedIcon}>
              ✓
            </div>

            <div>
              <p
                style={{
                  ...styles.statLabel,
                  color: colors.mutedText,
                }}
              >
                Completed
              </p>

              <h2
                style={{
                  ...styles.statNumber,
                  color: colors.text,
                }}
              >
                {isLoading
                  ? "..."
                  : completedMedicines}
              </h2>
            </div>
          </div>
        </section>

        <section style={styles.contentGrid}>
          <div
            style={{
              ...styles.chartContainer,
              backgroundColor: colors.card,
              boxShadow: colors.shadow,
            }}
          >
            <div style={styles.sectionHeading}>
              <div>
                <h2
                  style={{
                    ...styles.sectionTitle,
                    color: colors.text,
                  }}
                >
                  Medicine Statistics
                </h2>

                <p
                  style={{
                    ...styles.sectionSubtitle,
                    color: colors.lightText,
                  }}
                >
                  Active and completed medicine
                  overview
                </p>
              </div>
            </div>

            {isLoading ? (
              <div
                style={{
                  ...styles.loadingBox,
                  color: colors.mutedText,
                }}
              >
                Loading chart...
              </div>
            ) : totalMedicines === 0 ? (
              <div style={styles.emptyChartBox}>
                <div style={styles.emptyChartIcon}>
                  📊
                </div>

                <p
                  style={{
                    ...styles.emptyChartText,
                    color: colors.mutedText,
                  }}
                >
                  Add medicines to view your
                  statistics.
                </p>
              </div>
            ) : (
              <>
                <div style={styles.chartBox}>
                  <Doughnut
                    data={chartData}
                    options={chartOptions}
                  />
                </div>

                <div style={styles.chartSummary}>
                  <div style={styles.summaryItem}>
                    <span
                      style={styles.activeDot}
                    />

                    <div>
                      <strong
                        style={{
                          ...styles.summaryNumber,
                          color: colors.text,
                        }}
                      >
                        {activeMedicines}
                      </strong>

                      <p
                        style={{
                          ...styles.summaryLabel,
                          color: colors.mutedText,
                        }}
                      >
                        Active
                      </p>
                    </div>
                  </div>

                  <div style={styles.summaryItem}>
                    <span
                      style={styles.completedDot}
                    />

                    <div>
                      <strong
                        style={{
                          ...styles.summaryNumber,
                          color: colors.text,
                        }}
                      >
                        {completedMedicines}
                      </strong>

                      <p
                        style={{
                          ...styles.summaryLabel,
                          color: colors.mutedText,
                        }}
                      >
                        Completed
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
                    <div
            style={{
              ...styles.remindersContainer,
              backgroundColor: colors.card,
              boxShadow: colors.shadow,
            }}
          >
            <div style={styles.sectionHeading}>
              <div>
                <h2
                  style={{
                    ...styles.sectionTitle,
                    color: colors.text,
                  }}
                >
                  Today's Reminders
                </h2>

                <p
                  style={{
                    ...styles.sectionSubtitle,
                    color: colors.lightText,
                  }}
                >
                  Medicines scheduled for today
                </p>
              </div>

              <button
                type="button"
                style={styles.viewAllButton}
                onClick={() =>
                  navigate("/medicines")
                }
              >
                View all
              </button>
            </div>

            {isLoading ? (
              <div
                style={{
                  ...styles.loadingBox,
                  color: colors.mutedText,
                }}
              >
                Loading reminders...
              </div>
            ) : todaysReminders.length === 0 ? (
              <div style={styles.emptyReminderBox}>
                <div style={styles.emptyReminderIcon}>
                  🎉
                </div>

                <h3
                  style={{
                    ...styles.emptyReminderTitle,
                    color: colors.text,
                  }}
                >
                  No reminders today
                </h3>

                <p
                  style={{
                    ...styles.emptyReminderText,
                    color: colors.mutedText,
                  }}
                >
                  You do not have any active
                  medicines scheduled for today.
                </p>
              </div>
            ) : (
              <div style={styles.remindersList}>
                {todaysReminders.map(
                  (medicine) => (
                    <div
                      key={medicine.id}
                      style={{
                        ...styles.reminderCard,
                        backgroundColor:
                          colors.cardSecondary,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div style={styles.medicineIcon}>
                        💊
                      </div>

                      <div
                        style={
                          styles.reminderDetails
                        }
                      >
                        <h3
                          style={{
                            ...styles.medicineName,
                            color: colors.text,
                          }}
                        >
                          {medicine.medicine_name ||
                            "Medicine"}
                        </h3>

                        <p
                          style={{
                            ...styles.medicineDosage,
                            color:
                              colors.mutedText,
                          }}
                        >
                          {medicine.dosage ||
                            "No dosage provided"}
                        </p>
                      </div>

                      <div
                        style={
                          styles.reminderTime
                        }
                      >
                        {formatTime(
                          medicine.reminder_time
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    transition:
      "background-color .25s,color .25s",
  },

  navbar: {
    padding: "18px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  logo: {
    margin: 0,
    color: "#4f46e5",
    fontSize: "25px",
  },

  navButtons: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  notificationToggle: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "22px",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    transition: "background-color .2s",
    whiteSpace: "nowrap",
  },

  toggleTrack: {
    width: "38px",
    height: "20px",
    borderRadius: "999px",
    padding: "2px",
    display: "inline-flex",
    alignItems: "center",
    transition: "background-color .2s",
    boxSizing: "border-box",
  },

  toggleKnob: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    display: "block",
    transition: "transform .2s",
  },

  testNotificationButton: {
    padding: "10px 16px",
    border: "1px solid #16a34a",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "#16a34a",
    cursor: "pointer",
    fontWeight: "bold",
  },

  profileButton: {
    padding: "10px 17px",
    border: "1px solid #4f46e5",
    borderRadius: "8px",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "bold",
  },

  logoutButton: {
    padding: "10px 17px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
    container: {
    width: "min(1180px, 92%)",
    margin: "0 auto",
    padding: "35px 0 55px",
  },

  welcomeSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  welcomeLabel: {
    margin: "0 0 5px",
    color: "#4f46e5",
    fontSize: "15px",
    fontWeight: "bold",
  },

  welcomeTitle: {
    margin: "0 0 10px",
    fontSize: "34px",
    lineHeight: 1.2,
  },

  welcomeText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px",
  },

  welcomeButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  addMedicineButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  viewMedicineButton: {
    padding: "12px 20px",
    border: "1px solid #4f46e5",
    borderRadius: "9px",
    backgroundColor: "transparent",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  messageBox: {
    marginBottom: "22px",
    padding: "13px 16px",
    borderRadius: "9px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontWeight: "bold",
  },

  statisticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    padding: "22px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  totalIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    backgroundColor: "#ede9fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  reminderIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    backgroundColor: "#fef3c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  activeIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "bold",
  },

  completedIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    backgroundColor: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "bold",
  },

  statLabel: {
    margin: "0 0 7px",
    fontSize: "14px",
  },

  statNumber: {
    margin: 0,
    fontSize: "29px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },

  chartContainer: {
    padding: "25px",
    borderRadius: "15px",
    minHeight: "440px",
  },

  remindersContainer: {
    padding: "25px",
    borderRadius: "15px",
    minHeight: "440px",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "24px",
  },

  sectionTitle: {
    margin: "0 0 6px",
    fontSize: "21px",
  },

  sectionSubtitle: {
    margin: 0,
    fontSize: "14px",
  },

  viewAllButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "bold",
    padding: "6px",
  },

  chartBox: {
    height: "265px",
    maxWidth: "340px",
    margin: "0 auto",
  },

  chartSummary: {
    display: "flex",
    justifyContent: "center",
    gap: "45px",
    flexWrap: "wrap",
    marginTop: "25px",
  },

  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  activeDot: {
    width: "13px",
    height: "13px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
  },

  completedDot: {
    width: "13px",
    height: "13px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
  },

  summaryNumber: {
    fontSize: "20px",
  },

  summaryLabel: {
    margin: "3px 0 0",
    fontSize: "13px",
  },

  loadingBox: {
    height: "270px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
  },

  emptyChartBox: {
    height: "290px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  emptyChartIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },

  emptyChartText: {
    margin: 0,
    maxWidth: "260px",
    lineHeight: 1.6,
  },

  emptyReminderBox: {
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  emptyReminderIcon: {
    fontSize: "50px",
    marginBottom: "12px",
  },

  emptyReminderTitle: {
    margin: "0 0 9px",
    fontSize: "20px",
  },

  emptyReminderText: {
    margin: 0,
    maxWidth: "310px",
    lineHeight: 1.6,
  },

  remindersList: {
    display: "flex",
    flexDirection: "column",
    gap: "13px",
    maxHeight: "340px",
    overflowY: "auto",
    paddingRight: "4px",
  },

  reminderCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "15px",
    borderRadius: "11px",
  },

  medicineIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "10px",
    backgroundColor: "#ede9fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    flexShrink: 0,
  },

  reminderDetails: {
    flex: 1,
    minWidth: 0,
  },

  medicineName: {
    margin: "0 0 5px",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  medicineDosage: {
    margin: 0,
    fontSize: "13px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  reminderTime: {
    padding: "7px 10px",
    borderRadius: "7px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  reminderPopup: {
    position: "fixed",
    top: "88px",
    right: "24px",
    width: "min(360px, calc(100vw - 32px))",
    padding: "20px",
    borderRadius: "16px",
    zIndex: 9999,
  },

  reminderPopupHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
  },

  reminderPopupIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    backgroundColor: "#ede9fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    flexShrink: 0,
  },

  reminderPopupTitle: {
    margin: "0 0 4px",
    fontSize: "18px",
  },

  reminderPopupSubtitle: {
    margin: 0,
    fontSize: "13px",
  },

  reminderPopupMedicine: {
    padding: "13px",
    borderRadius: "10px",
    display: "grid",
    gap: "5px",
    marginBottom: "15px",
  },

  reminderPopupTime: {
    marginTop: "3px",
    color: "#4f46e5",
    fontWeight: "bold",
    fontSize: "14px",
  },

  reminderPopupActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  takenButton: {
    flex: 1,
    minWidth: "110px",
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  snoozeButton: {
    flex: 1,
    minWidth: "140px",
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

};

export default Dashboard;