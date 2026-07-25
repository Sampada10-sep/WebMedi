import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditMedicine() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    medicineName: "",
    dosage: "",
    reminderTime: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "Active",
  });

  const [message, setMessage] = useState("Loading medicine...");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDateForInput = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    return new Date(dateValue).toISOString().split("T")[0];
  };

  const formatTimeForInput = (timeValue) => {
    if (!timeValue) {
      return "";
    }

    return timeValue.slice(0, 5);
  };

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const response = await fetch(
          `https://medireminder-backend-un9x.onrender.com/api/medicines/${id}`
        );

        const data = await response.json();

        if (response.ok) {
          const medicine = data.medicine || data;

          setFormData({
            medicineName: medicine.medicine_name || "",
            dosage: medicine.dosage || "",
            reminderTime: formatTimeForInput(
              medicine.reminder_time
            ),
            startDate: formatDateForInput(medicine.start_date),
            endDate: formatDateForInput(medicine.end_date),
            description: medicine.description || "",
            status: medicine.status || "Active",
          });

          setMessage("");
        } else {
          setMessage(
            data.message || "Failed to load medicine details."
          );
        }
      } catch (error) {
        console.error("Fetch medicine error:", error);
        setMessage("Cannot connect to the backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsUpdating(true);

    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setMessage("Please log in again.");
      setIsUpdating(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `https://medireminder-backend-un9x.onrender.com/api/medicines/${id}`,
        {
          method: "PUT",
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
            status: formData.status,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Medicine updated successfully.");

        setTimeout(() => {
          navigate("/medicines");
        }, 1000);
      } else {
        setMessage(
          data.message || "Failed to update medicine."
        );
      }
    } catch (error) {
      console.error("Update medicine error:", error);
      setMessage("Cannot connect to the backend.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingPage}>
        <p style={styles.loadingText}>{message}</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate("/medicines")}
        >
          ← Back to My Medicines
        </button>

        <div style={styles.header}>
          <div style={styles.icon}>✏️</div>

          <div>
            <h1 style={styles.title}>Edit Medicine</h1>

            <p style={styles.subtitle}>
              Update your medicine and reminder details.
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
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="status" style={styles.label}>
              Status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="description" style={styles.label}>
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Example: Take after food"
              rows="4"
              style={styles.textarea}
            />
          </div>

          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => navigate("/medicines")}
              disabled={isUpdating}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={isUpdating}
            >
              {isUpdating
                ? "Updating..."
                : "Update Medicine"}
            </button>
          </div>

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

  loadingPage: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },

  loadingText: {
    padding: "15px 25px",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    borderRadius: "10px",
    fontWeight: "bold",
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
    backgroundColor: "#fef3c7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
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
  backgroundColor: "#ffffff",
  color: "#1f2937",
  WebkitTextFillColor: "#1f2937",
  caretColor: "#1f2937",
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
  backgroundColor: "#ffffff",
  color: "#1f2937",
  WebkitTextFillColor: "#1f2937",
  caretColor: "#1f2937",
},

  dateRow: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
  },

  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },

  cancelButton: {
    width: "100%",
    padding: "14px",
    border: "1px solid #4f46e5",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#4f46e5",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
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

export default EditMedicine;