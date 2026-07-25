import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddMedicine.css";

function AddMedicine() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    medicineName: "",
    dosage: "",
    reminderTime: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setMessage("Please log in again.");
      setIsLoading(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/medicines",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: Number(userId),
            medicine_name: formData.medicineName,
            dosage: formData.dosage,
            description: formData.description,
            reminder_time: formData.reminderTime,
            start_date: formData.startDate,
            end_date: formData.endDate,
            status: "Active",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Medicine added successfully.");

        setTimeout(() => {
          navigate("/medicines");
        }, 1000);
      } else {
        setMessage(data.message || "Failed to add medicine.");
      }
    } catch (error) {
      console.error("Add medicine error:", error);
      setMessage("Cannot connect to the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div style={styles.header}>
          <div style={styles.icon}>💊</div>

          <div>
            <h1 style={styles.title}>Add Medicine</h1>
            <p style={styles.subtitle}>
              Enter your medicine and reminder details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="medicineName" style={styles.label}>
              Medicine Name
            </label>

              <input
              id="medicineName"
              type="text"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleChange}
             placeholder="Example: Paracetamol"
             className="medicine-input"
             style={styles.input}
               required
               />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="dosage" style={styles.label}>
              Dosage
            </label>

            <input
            id="dosage"
           type="text"
            name="dosage"
            value={formData.dosage}
           onChange={handleChange}
           placeholder="Example: 500 mg"
           className="medicine-input"
           style={styles.input}
           required
           />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="reminderTime" style={styles.label}>
              Reminder Time
            </label>

              <input
            id="reminderTime"
             type="time"
            name="reminderTime"
            value={formData.reminderTime}
              onChange={handleChange}
             className="medicine-input"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.dateRow}>
            <div style={styles.formGroup}>
              <label htmlFor="startDate" style={styles.label}>
                Start Date
              </label>

              <input
              id="startDate"
            type="date"
            name="startDate"
             value={formData.startDate}
             onChange={handleChange}
            className="medicine-input"
            style={styles.input}
            required
            />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="endDate" style={styles.label}>
                End Date
              </label>

              <input
             id="endDate"
             type="date"
            name="endDate"
           value={formData.endDate}
            onChange={handleChange}
            className="medicine-input"
           style={styles.input}
           required
            />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="description" style={styles.label}>
              Description
            </label>

            <textarea
           id="description"
            className="medicine-textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Example: Take after food"
              rows="4"
              style={styles.textarea}
            />
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Add Medicine"}
          </button>

          {message && <p style={styles.message}>{message}</p>}
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "700px",
    backgroundColor: "#ffffff",
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  },

  backButton: {
    backgroundColor: "transparent",
    color: "#4f46e5",
    border: "none",
    padding: 0,
    marginBottom: "25px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
  },

  icon: {
    width: "55px",
    height: "55px",
    borderRadius: "14px",
    backgroundColor: "#eef2ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "30px",
  },

  title: {
    margin: 0,
    color: "#1f2937",
    fontSize: "30px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
    width: "100%",
  },

  label: {
    marginBottom: "8px",
    color: "#374151",
    fontWeight: "bold",
  },

  input: {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  border: "1px solid #d1d5db",
  borderRadius: "9px",
  fontSize: "16px",
  outline: "none",
  backgroundColor: "#3b3b3b",
  color: "#ffffff",
  WebkitTextFillColor: "#ffffff",
  colorScheme: "dark",
},

 textarea: {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  border: "1px solid #d1d5db",
  borderRadius: "9px",
  fontSize: "16px",
  resize: "vertical",
  outline: "none",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#3b3b3b",
  color: "#ffffff",
  WebkitTextFillColor: "#ffffff",
  colorScheme: "dark",
},
  dateRow: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
  },

  submitButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  message: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default AddMedicine;