import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyMedicines() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [message, setMessage] = useState("Loading medicines...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/medicines"
        );

        const data = await response.json();

        if (response.ok) {
          setMedicines(data.medicines || []);

          if (data.medicines && data.medicines.length > 0) {
            setMessage("");
          } else {
            setMessage("No medicines found.");
          }
        } else {
          setMessage(data.message || "Failed to load medicines.");
        }
      } catch (error) {
        console.error("Fetch medicines error:", error);
        setMessage("Cannot connect to the backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/medicines/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMedicines((currentMedicines) =>
          currentMedicines.filter(
            (medicine) => medicine.id !== id
          )
        );

        setMessage("Medicine deleted successfully.");

        setTimeout(() => {
          setMessage("");
        }, 2000);
      } else {
        setMessage(data.message || "Failed to delete medicine.");
      }
    } catch (error) {
      console.error("Delete medicine error:", error);
      setMessage("Cannot connect to the backend.");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    return new Date(dateValue).toLocaleDateString("en-GB");
  };

  const formatTime = (timeValue) => {
    if (!timeValue) {
      return "";
    }

    const timeParts = timeValue.split(":");
    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);

    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>My Medicines</h1>

            <p style={styles.subtitle}>
              View, edit, and delete your medicine reminders.
            </p>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>

            <button
              type="button"
              style={styles.addButton}
              onClick={() => navigate("/add-medicine")}
            >
              + Add Medicine
            </button>
          </div>
        </div>

        {message && (
          <div style={styles.messageBox}>
            {message}
          </div>
        )}

        {!isLoading && medicines.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Medicine</th>
                  <th style={styles.tableHeader}>Dosage</th>
                  <th style={styles.tableHeader}>Time</th>
                  <th style={styles.tableHeader}>Start Date</th>
                  <th style={styles.tableHeader}>End Date</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td style={styles.tableCell}>
                      <strong>
                        {medicine.medicine_name}
                      </strong>

                      <div style={styles.description}>
                        {medicine.description}
                      </div>
                    </td>

                    <td style={styles.tableCell}>
                      {medicine.dosage}
                    </td>

                    <td style={styles.tableCell}>
                      {formatTime(medicine.reminder_time)}
                    </td>

                    <td style={styles.tableCell}>
                      {formatDate(medicine.start_date)}
                    </td>

                    <td style={styles.tableCell}>
                      {formatDate(medicine.end_date)}
                    </td>

                    <td style={styles.tableCell}>
                      <span style={styles.statusBadge}>
                        {medicine.status}
                      </span>
                    </td>

                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button
                          type="button"
                          style={styles.editButton}
                          onClick={() =>
                            navigate(
                              `/edit-medicine/${medicine.id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          style={styles.deleteButton}
                          onClick={() =>
                            handleDelete(medicine.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fb",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    color: "#1f2937",
    fontSize: "32px",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
  },

  buttonGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  backButton: {
    padding: "11px 18px",
    border: "1px solid #4f46e5",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "bold",
  },

  addButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  messageBox: {
    padding: "14px",
    marginBottom: "20px",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "bold",
  },

  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "950px",
  },

  tableHeader: {
    padding: "16px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    textAlign: "left",
  },

  tableCell: {
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
    verticalAlign: "top",
  },

  description: {
    marginTop: "5px",
    color: "#6b7280",
    fontSize: "13px",
  },

  statusBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: "13px",
    fontWeight: "bold",
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
  },

  editButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  deleteButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default MyMedicines;