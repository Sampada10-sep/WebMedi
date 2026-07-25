import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://medireminder-backend-un9x.onrender.com/api/medicines";

function MyMedicines() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [message, setMessage] = useState("Loading medicines...");
  const [isLoading, setIsLoading] = useState(true);

  const [updatingMedicineId, setUpdatingMedicineId] =
    useState(null);

  const [selectedMedicineId, setSelectedMedicineId] =
    useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMedicines = async () => {
      try {
        setIsLoading(true);
        setMessage("Loading medicines...");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load medicines."
          );
        }

        const medicineList = Array.isArray(data)
          ? data
          : data.medicines || [];

        console.log("Medicines from backend:", medicineList);

        setMedicines(medicineList);

        setMessage(
          medicineList.length === 0
            ? "No medicines found."
            : ""
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fetch medicines error:", error);
          setMessage("Cannot connect to the backend.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicines();

    return () => controller.abort();
  }, []);

  /*
   * Converts every value into searchable lowercase text.
   * This prevents errors when dosage or another value is a number.
   */
  const normalizeText = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value).trim().toLowerCase();
  };

  /*
   * Search and status filtering
   */
  const filteredMedicines = useMemo(() => {
    const searchValue = normalizeText(searchText);

    return medicines.filter((medicine) => {
      /*
       * Supports different possible backend field names.
       */
      const medicineName = normalizeText(
        medicine.medicine_name ||
          medicine.medicineName ||
          medicine.name
      );

      const dosage = normalizeText(medicine.dosage);

      const description = normalizeText(
        medicine.description
      );

      const reminderTime = normalizeText(
        medicine.reminder_time || medicine.reminderTime
      );

      const status = normalizeText(medicine.status);

      const matchesSearch =
        searchValue === "" ||
        medicineName.includes(searchValue) ||
        dosage.includes(searchValue) ||
        description.includes(searchValue) ||
        reminderTime.includes(searchValue) ||
        status.includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        status === normalizeText(statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [medicines, searchText, statusFilter]);

  const showTemporaryMessage = (text) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const updateMedicineStatus = async (
    medicine,
    newStatus
  ) => {
    try {
      setUpdatingMedicineId(medicine.id);
      setMessage("");

      const response = await fetch(
        `${API_URL}/${medicine.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicine_name:
              medicine.medicine_name ||
              medicine.medicineName ||
              medicine.name,

            dosage: medicine.dosage,

            description: medicine.description || "",

            reminder_time:
              medicine.reminder_time ||
              medicine.reminderTime,

            start_date:
              medicine.start_date || medicine.startDate,

            end_date:
              medicine.end_date || medicine.endDate,

            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update medicine status."
        );
      }

      setMedicines((currentMedicines) =>
        currentMedicines.map((currentMedicine) =>
          Number(currentMedicine.id) === Number(medicine.id)
            ? {
                ...currentMedicine,
                status: newStatus,
              }
            : currentMedicine
        )
      );

      showTemporaryMessage(
        `Medicine status changed to ${newStatus}.`
      );
    } catch (error) {
      console.error(
        "Update medicine status error:",
        error
      );

      setMessage(
        error.message || "Cannot connect to the backend."
      );
    } finally {
      setUpdatingMedicineId(null);
    }
  };

  const openDeleteModal = (medicineId) => {
    setSelectedMedicineId(medicineId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setShowDeleteModal(false);
    setSelectedMedicineId(null);
  };

  const handleDelete = async () => {
    if (!selectedMedicineId) {
      return;
    }

    try {
      setIsDeleting(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/${selectedMedicineId}`,
        {
          method: "DELETE",
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
          data.message || "Failed to delete medicine."
        );
      }

      setMedicines((currentMedicines) =>
        currentMedicines.filter(
          (medicine) =>
            Number(medicine.id) !==
            Number(selectedMedicineId)
        )
      );

      setShowDeleteModal(false);
      setSelectedMedicineId(null);

      showTemporaryMessage(
        "Medicine deleted successfully."
      );
    } catch (error) {
      console.error("Delete medicine error:", error);

      setMessage(
        error.message || "Cannot connect to the backend."
      );

      setShowDeleteModal(false);
      setSelectedMedicineId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-GB");
  };

  const formatTime = (timeValue) => {
    if (!timeValue) {
      return "—";
    }

    const timeParts = String(timeValue).split(":");

    if (timeParts.length < 2) {
      return timeValue;
    }

    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

    const date = new Date();
    date.setHours(hours, minutes, 0);

    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    const value = normalizeText(status);

    if (value === "completed") {
      return {
        ...styles.statusSelect,
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (value === "inactive") {
      return {
        ...styles.statusSelect,
        backgroundColor: "#f3f4f6",
        color: "#4b5563",
      };
    }

    return {
      ...styles.statusSelect,
      backgroundColor: "#dcfce7",
      color: "#166534",
    };
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>My Medicines</h1>

            <p style={styles.subtitle}>
              Search, filter, edit and manage your medicines.
            </p>
          </div>

          <div style={styles.topButtons}>
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

        <div style={styles.filterSection}>
          <div style={styles.searchContainer}>
            <input
              type="search"
              placeholder="Search medicine, dosage or description..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              style={styles.searchInput}
            />

            {searchText && (
              <button
                type="button"
                style={styles.clearSearchButton}
                onClick={() => setSearchText("")}
              >
                Clear
              </button>
            )}
          </div>

          <div style={styles.filterButtons}>
            {[
              "All",
              "Active",
              "Completed",
              "Inactive",
            ].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  ...styles.filterButton,
                  ...(statusFilter === status
                    ? styles.activeFilterButton
                    : {}),
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {!isLoading && (
            <p style={styles.resultCount}>
              Showing {filteredMedicines.length} of{" "}
              {medicines.length} medicines
            </p>
          )}
        </div>

        {message && (
          <div style={styles.messageBox}>{message}</div>
        )}

        {isLoading ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>
              Loading medicines...
            </h3>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>
              No medicines found
            </h3>

            <p style={styles.emptyText}>
              Try changing your search text or status filter.
            </p>

            <button
              type="button"
              style={styles.resetButton}
              onClick={() => {
                setSearchText("");
                setStatusFilter("All");
              }}
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredMedicines.map((medicine) => {
              const medicineName =
                medicine.medicine_name ||
                medicine.medicineName ||
                medicine.name ||
                "Unnamed Medicine";

              const reminderTime =
                medicine.reminder_time ||
                medicine.reminderTime;

              const startDate =
                medicine.start_date ||
                medicine.startDate;

              const endDate =
                medicine.end_date || medicine.endDate;

              return (
                <div key={medicine.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitleSection}>
                      <h2 style={styles.medicineName}>
                        {medicineName}
                      </h2>

                      <p style={styles.dosage}>
                        {medicine.dosage ||
                          "No dosage provided"}
                      </p>
                    </div>

                    <select
                      value={medicine.status || "Active"}
                      disabled={
                        updatingMedicineId === medicine.id
                      }
                      onChange={(event) =>
                        updateMedicineStatus(
                          medicine,
                          event.target.value
                        )
                      }
                      style={getStatusStyle(
                        medicine.status
                      )}
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                  <div style={styles.details}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>
                        Reminder Time
                      </span>

                      <span style={styles.detailValue}>
                        {formatTime(reminderTime)}
                      </span>
                    </div>

                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>
                        Start Date
                      </span>

                      <span style={styles.detailValue}>
                        {formatDate(startDate)}
                      </span>
                    </div>

                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>
                        End Date
                      </span>

                      <span style={styles.detailValue}>
                        {formatDate(endDate)}
                      </span>
                    </div>
                  </div>

                  <div style={styles.descriptionSection}>
                    <p style={styles.descriptionLabel}>
                      Description
                    </p>

                    <p style={styles.description}>
                      {medicine.description ||
                        "No description provided."}
                    </p>
                  </div>

                  <div style={styles.cardButtons}>
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
                        openDeleteModal(medicine.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div
          style={styles.modalOverlay}
          onClick={closeDeleteModal}
        >
          <div
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 style={styles.modalTitle}>
              Delete Medicine
            </h2>

            <p style={styles.modalText}>
              Are you sure you want to delete this medicine?
              This action cannot be undone.
            </p>

            <div style={styles.modalButtons}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                style={styles.confirmDeleteButton}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  title: {
    margin: "0",
    color: "#1f2937",
    fontSize: "clamp(28px, 5vw, 36px)",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: "0",
    color: "#6b7280",
    fontSize: "16px",
  },

  topButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  backButton: {
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    padding: "11px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  addButton: {
    border: "none",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  filterSection: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
  },

  searchContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "16px",
  },

  searchInput: {
    flex: "1",
    width: "100%",
    minWidth: "0",
    boxSizing: "border-box",
    padding: "13px 15px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#1f2937",
  },

  clearSearchButton: {
    border: "none",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    padding: "12px 14px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
  },

  filterButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  filterButton: {
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#4b5563",
    padding: "9px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  activeFilterButton: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
    color: "#ffffff",
  },

  resultCount: {
    margin: "16px 0 0",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "600",
  },

  messageBox: {
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(310px, 100%), 1fr))",
    gap: "22px",
  },

  card: {
    minWidth: "0",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 6px 22px rgba(0, 0, 0, 0.07)",
    border: "1px solid #eef0f4",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "20px",
  },

  cardTitleSection: {
    minWidth: "0",
    flex: "1",
  },

  medicineName: {
    margin: "0",
    color: "#1f2937",
    fontSize: "22px",
    fontWeight: "700",
    overflowWrap: "anywhere",
  },

  dosage: {
    marginTop: "6px",
    marginBottom: "0",
    color: "#6b7280",
    fontSize: "14px",
    overflowWrap: "anywhere",
  },

  statusSelect: {
    maxWidth: "125px",
    border: "none",
    borderRadius: "20px",
    padding: "8px 10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    outline: "none",
  },

  details: {
    borderTop: "1px solid #eeeeee",
    borderBottom: "1px solid #eeeeee",
    padding: "14px 0",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "10px",
  },

  detailLabel: {
    color: "#6b7280",
    fontSize: "14px",
  },

  detailValue: {
    color: "#1f2937",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "right",
  },

  descriptionSection: {
    marginTop: "16px",
  },

  descriptionLabel: {
    margin: "0 0 7px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "700",
  },

  description: {
    margin: "0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.6",
    minHeight: "44px",
    overflowWrap: "anywhere",
  },

  cardButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },

  editButton: {
    flex: "1",
    border: "none",
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    padding: "11px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
  },

  deleteButton: {
    flex: "1",
    border: "none",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "11px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
  },

  emptyState: {
    backgroundColor: "#ffffff",
    textAlign: "center",
    padding: "60px 20px",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
  },

  emptyTitle: {
    margin: "0 0 8px",
    color: "#1f2937",
    fontSize: "22px",
  },

  emptyText: {
    margin: "0",
    color: "#6b7280",
    fontSize: "15px",
  },

  resetButton: {
    border: "none",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    padding: "11px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "18px",
  },

  modalOverlay: {
    position: "fixed",
    inset: "0",
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: "1000",
  },

  modal: {
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
    boxSizing: "border-box",
  },

  modalTitle: {
    margin: "0 0 12px",
    color: "#1f2937",
    fontSize: "24px",
  },

  modalText: {
    margin: "0",
    color: "#6b7280",
    lineHeight: "1.6",
    fontSize: "15px",
  },

  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },

  cancelButton: {
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    padding: "10px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
  },

  confirmDeleteButton: {
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default MyMedicines;