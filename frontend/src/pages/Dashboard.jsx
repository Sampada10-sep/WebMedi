import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const userName =
    localStorage.getItem("user_name") || "User";

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

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (response.ok) {
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
          setMessage("");
        } else {
          setMessage(
            data.message ||
              "Failed to load medicines."
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Dashboard fetch error:",
            error
          );

          setMessage(
            "Cannot connect to the backend."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadMedicines();

    return () => {
      controller.abort();
    };
  }, []);

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
      String(today.getMonth() + 1).padStart(2, "0"),
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
          ? String(medicine.start_date).split("T")[0]
          : "";

        const endDate = medicine.end_date
          ? String(medicine.end_date).split("T")[0]
          : "";

        const hasStarted =
          !startDate || startDate <= todayString;

        const hasNotEnded =
          !endDate || endDate >= todayString;

        return hasStarted && hasNotEnded;
      })
      .sort((firstMedicine, secondMedicine) =>
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
          "#ffffff",
          "#ffffff",
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
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>
          MediReminder
        </h2>

        <div style={styles.navButtons}>
          <button
            type="button"
            style={styles.profileButton}
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
          <div style={styles.statCard}>
            <div style={styles.totalIcon}>
              💊
            </div>

            <div>
              <p style={styles.statLabel}>
                Total Medicines
              </p>

              <h2 style={styles.statNumber}>
                {isLoading
                  ? "..."
                  : totalMedicines}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.reminderIcon}>
              ⏰
            </div>

            <div>
              <p style={styles.statLabel}>
                Today&apos;s Reminders
              </p>

              <h2 style={styles.statNumber}>
                {isLoading
                  ? "..."
                  : todaysReminders.length}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.activeIcon}>
              ✓
            </div>

            <div>
              <p style={styles.statLabel}>
                Active Medicines
              </p>

              <h2 style={styles.statNumber}>
                {isLoading
                  ? "..."
                  : activeMedicines}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.completedIcon}>
              ✓
            </div>

            <div>
              <p style={styles.statLabel}>
                Completed
              </p>

              <h2 style={styles.statNumber}>
                {isLoading
                  ? "..."
                  : completedMedicines}
              </h2>
            </div>
          </div>
        </section>

        <section style={styles.contentGrid}>
          <div style={styles.chartContainer}>
            <div style={styles.sectionHeading}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Medicine Statistics
                </h2>

                <p style={styles.sectionSubtitle}>
                  Active and completed medicine
                  overview
                </p>
              </div>
            </div>

            {isLoading ? (
              <div style={styles.loadingBox}>
                Loading chart...
              </div>
            ) : totalMedicines === 0 ? (
              <div style={styles.emptyChartBox}>
                <div style={styles.emptyChartIcon}>
                  📊
                </div>

                <p style={styles.emptyChartText}>
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
                        style={styles.summaryNumber}
                      >
                        {activeMedicines}
                      </strong>

                      <p style={styles.summaryLabel}>
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
                        style={styles.summaryNumber}
                      >
                        {completedMedicines}
                      </strong>

                      <p style={styles.summaryLabel}>
                        Completed
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={styles.remindersContainer}>
            <div style={styles.sectionHeading}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Today&apos;s Reminders
                </h2>

                <p style={styles.sectionSubtitle}>
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
              <div style={styles.loadingBox}>
                Loading reminders...
              </div>
            ) : todaysReminders.length === 0 ? (
              <div style={styles.emptyReminderBox}>
                <div
                  style={styles.emptyReminderIcon}
                >
                  🎉
                </div>

                <h3
                  style={styles.emptyReminderTitle}
                >
                  No reminders today
                </h3>

                <p
                  style={styles.emptyReminderText}
                >
                  You do not have any active medicines
                  scheduled for today.
                </p>
              </div>
            ) : (
              <div style={styles.remindersList}>
                {todaysReminders.map(
                  (medicine) => (
                    <div
                      key={medicine.id}
                      style={styles.reminderCard}
                    >
                      <div
                        style={styles.medicineIcon}
                      >
                        💊
                      </div>

                      <div
                        style={styles.reminderDetails}
                      >
                        <h3
                          style={styles.medicineName}
                        >
                          {medicine.medicine_name ||
                            "Medicine"}
                        </h3>

                        <p
                          style={
                            styles.medicineDosage
                          }
                        >
                          {medicine.dosage ||
                            "No dosage provided"}
                        </p>
                      </div>

                      <div
                        style={styles.reminderTime}
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
    backgroundColor: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
  },

  navbar: {
    backgroundColor: "#ffffff",
    padding: "18px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow:
      "0 2px 14px rgba(0, 0, 0, 0.06)",
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
  },

  profileButton: {
    padding: "10px 17px",
    border: "1px solid #4f46e5",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "bold",
  },

  logoutButton: {
    padding: "10px 17px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  container: {
    width: "100%",
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "38px 20px",
    boxSizing: "border-box",
  },

  welcomeSection: {
    background:
      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    borderRadius: "20px",
    padding: "35px",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    flexWrap: "wrap",
    marginBottom: "25px",
    boxShadow:
      "0 15px 35px rgba(79, 70, 229, 0.25)",
  },

  welcomeLabel: {
    margin: "0 0 6px",
    color: "#ddd6fe",
    fontSize: "15px",
    fontWeight: "bold",
  },

  welcomeTitle: {
    margin: "0 0 10px",
    fontSize: "34px",
  },

  welcomeText: {
    margin: 0,
    color: "#ede9fe",
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
    backgroundColor: "#ffffff",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "bold",
  },

  viewMedicineButton: {
    padding: "12px 20px",
    border:
      "1px solid rgba(255, 255, 255, 0.65)",
    borderRadius: "9px",
    backgroundColor: "transparent",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  messageBox: {
    marginBottom: "22px",
    padding: "14px",
    borderRadius: "9px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    textAlign: "center",
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
    backgroundColor: "#ffffff",
    borderRadius: "15px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow:
      "0 7px 22px rgba(0, 0, 0, 0.07)",
  },

  totalIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
    backgroundColor: "#ede9fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
  },

  reminderIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
    backgroundColor: "#fef3c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
  },

  activeIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "bold",
  },

  completedIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
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
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "bold",
  },

  statNumber: {
    margin: 0,
    color: "#1f2937",
    fontSize: "29px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "25px",
    alignItems: "stretch",
  },

  chartContainer: {
    backgroundColor: "#ffffff",
    padding: "27px",
    borderRadius: "16px",
    boxShadow:
      "0 7px 22px rgba(0, 0, 0, 0.07)",
  },

  remindersContainer: {
    backgroundColor: "#ffffff",
    padding: "27px",
    borderRadius: "16px",
    boxShadow:
      "0 7px 22px rgba(0, 0, 0, 0.07)",
  },

  sectionHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "22px",
  },

  sectionTitle: {
    margin: "0 0 6px",
    color: "#1f2937",
    fontSize: "21px",
  },

  sectionSubtitle: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "14px",
  },

  chartBox: {
    width: "100%",
    maxWidth: "330px",
    height: "300px",
    margin: "0 auto",
  },

  chartSummary: {
    display: "flex",
    justifyContent: "center",
    gap: "35px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
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
    display: "block",
    color: "#1f2937",
    fontSize: "20px",
  },

  summaryLabel: {
    margin: "3px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  viewAllButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "bold",
  },

  remindersList: {
    display: "flex",
    flexDirection: "column",
    gap: "13px",
  },

  reminderCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "15px",
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    border: "1px solid #f1f5f9",
  },

  medicineIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#ede9fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    flexShrink: 0,
  },

  reminderDetails: {
    flex: 1,
  },

  medicineName: {
    margin: "0 0 5px",
    color: "#1f2937",
    fontSize: "16px",
  },

  medicineDosage: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
  },

  reminderTime: {
    color: "#4f46e5",
    fontWeight: "bold",
    fontSize: "14px",
  },

  loadingBox: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#6b7280",
  },

  emptyChartBox: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },

  emptyChartIcon: {
    fontSize: "50px",
    marginBottom: "15px",
  },

  emptyChartText: {
    color: "#6b7280",
  },

  emptyReminderBox: {
    minHeight: "270px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
  },

  emptyReminderIcon: {
    fontSize: "48px",
    marginBottom: "13px",
  },

  emptyReminderTitle: {
    margin: "0 0 8px",
    color: "#1f2937",
  },

  emptyReminderText: {
    margin: 0,
    maxWidth: "320px",
    color: "#6b7280",
    lineHeight: "1.5",
  },
};

export default Dashboard;