import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>MediReminder</h1>
          <p style={styles.subtitle}>Manage your medicines easily</p>
        </div>

        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.welcomeCard}>
          <div>
            <p style={styles.smallText}>Welcome back</p>
            <h2 style={styles.welcomeTitle}>Hello, Sampada 👋</h2>
            <p style={styles.welcomeText}>
              Keep track of your medicines and never miss a dose.
            </p>
          </div>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/add-medicine")}
          >
            + Add Medicine
          </button>
        </section>

        <section style={styles.statsContainer}>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>0</p>
            <p style={styles.statLabel}>Total Medicines</p>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statNumber}>0</p>
            <p style={styles.statLabel}>Today's Reminders</p>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statNumber}>0</p>
            <p style={styles.statLabel}>Completed</p>
          </div>
        </section>

        <section>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>

          <div style={styles.actionGrid}>
            <button
              style={styles.actionCard}
              onClick={() => navigate("/add-medicine")}
            >
              <span style={styles.icon}>💊</span>
              <span style={styles.actionTitle}>Add Medicine</span>
              <span style={styles.actionText}>
                Add medicine and reminder details
              </span>
            </button>

            <button
              style={styles.actionCard}
              onClick={() => navigate("/medicines")}
            >
              <span style={styles.icon}>📋</span>
              <span style={styles.actionTitle}>My Medicines</span>
              <span style={styles.actionText}>
                View, edit, or delete medicines
              </span>
            </button>

            <button
              style={styles.actionCard}
              onClick={() => navigate("/profile")}
            >
              <span style={styles.icon}>👤</span>
              <span style={styles.actionTitle}>Profile</span>
              <span style={styles.actionText}>
                View and manage your account
              </span>
            </button>
          </div>
        </section>

        <section style={styles.reminderSection}>
          <div>
            <h2 style={styles.sectionTitle}>Today's Reminders</h2>
            <p style={styles.emptyText}>
              You do not have any medicine reminders today.
            </p>
          </div>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/add-medicine")}
          >
            Add Reminder
          </button>
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

  header: {
    backgroundColor: "#ffffff",
    padding: "20px 8%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
  },

  logo: {
    margin: 0,
    color: "#4f46e5",
    fontSize: "28px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
  },

  logoutButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
  },

  main: {
    width: "84%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 0",
  },

  welcomeCard: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    borderRadius: "18px",
    padding: "35px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  smallText: {
    margin: 0,
    opacity: 0.9,
  },

  welcomeTitle: {
    margin: "8px 0",
    fontSize: "32px",
  },

  welcomeText: {
    margin: 0,
    opacity: 0.9,
  },

  primaryButton: {
    padding: "13px 22px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    color: "#4f46e5",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    margin: "30px 0",
  },

  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "25px",
    textAlign: "center",
    boxShadow: "0 5px 18px rgba(0, 0, 0, 0.06)",
  },

  statNumber: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "bold",
    color: "#4f46e5",
  },

  statLabel: {
    margin: "8px 0 0",
    color: "#6b7280",
  },

  sectionTitle: {
    color: "#1f2937",
    marginBottom: "20px",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  actionCard: {
    backgroundColor: "#ffffff",
    border: "none",
    borderRadius: "14px",
    padding: "28px",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 5px 18px rgba(0, 0, 0, 0.06)",
    cursor: "pointer",
  },

  icon: {
    fontSize: "35px",
    marginBottom: "15px",
  },

  actionTitle: {
    fontSize: "19px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "8px",
  },

  actionText: {
    color: "#6b7280",
    lineHeight: "1.5",
  },

  reminderSection: {
    marginTop: "35px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 5px 18px rgba(0, 0, 0, 0.06)",
  },

  emptyText: {
    color: "#6b7280",
    margin: 0,
  },

  secondaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
  },
};

export default Dashboard;