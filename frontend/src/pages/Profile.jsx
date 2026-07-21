import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("user_name") || "User";
  const userEmail =
    localStorage.getItem("user_email") || "Not Available";
  const userId = localStorage.getItem("user_id") || "N/A";

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profile_image") || ""
  );

  const [message, setMessage] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage("Please choose an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageData = reader.result;

      setProfileImage(imageData);
      localStorage.setItem("profile_image", imageData);

      setMessage("Profile picture updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    };

    reader.onerror = () => {
      setMessage("Failed to upload the image.");
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    localStorage.removeItem("profile_image");
    setProfileImage("");
    setMessage("Profile picture removed.");

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");

    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.profileHeader}>
          <div style={styles.avatarWrapper}>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                style={styles.avatarImage}
              />
            ) : (
              <div style={styles.defaultAvatar}>👤</div>
            )}
          </div>

          <label style={styles.uploadButton}>
            Choose Photo

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={styles.hiddenInput}
            />
          </label>

          {profileImage && (
            <button
              type="button"
              style={styles.removePhotoButton}
              onClick={handleRemovePhoto}
            >
              Remove Photo
            </button>
          )}
        </div>

        <h1 style={styles.title}>My Profile</h1>

        {message && (
          <div style={styles.messageBox}>
            {message}
          </div>
        )}

        <div style={styles.infoBox}>
          <label style={styles.label}>Full Name</label>

          <p style={styles.value}>{userName}</p>
        </div>

        <div style={styles.infoBox}>
          <label style={styles.label}>Email</label>

          <p style={styles.value}>{userEmail}</p>
        </div>

        <div style={styles.infoBox}>
          <label style={styles.label}>User ID</label>

          <p style={styles.value}>{userId}</p>
        </div>

        <div style={styles.infoBox}>
          <label style={styles.label}>Account Status</label>

          <p style={styles.activeValue}>Active</p>
        </div>

        <div style={styles.buttonContainer}>
          <button
            type="button"
            style={styles.dashboardButton}
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
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
    padding: "25px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "35px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    boxSizing: "border-box",
  },

  profileHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  avatarWrapper: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "5px solid #4f46e5",
    backgroundColor: "#eef2ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  defaultAvatar: {
    width: "100%",
    height: "100%",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "55px",
  },

  uploadButton: {
    marginTop: "15px",
    padding: "9px 18px",
    borderRadius: "8px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },

  hiddenInput: {
    display: "none",
  },

  removePhotoButton: {
    marginTop: "10px",
    border: "none",
    backgroundColor: "transparent",
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: "bold",
  },

  title: {
    margin: "25px 0 30px",
    textAlign: "center",
    color: "#4f46e5",
    fontSize: "32px",
  },

  messageBox: {
    marginBottom: "20px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },

  infoBox: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    color: "#6b7280",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: "bold",
  },

  value: {
    margin: 0,
    padding: "13px",
    borderRadius: "9px",
    backgroundColor: "#f8fafc",
    color: "#374151",
    fontSize: "16px",
    overflowWrap: "anywhere",
  },

  activeValue: {
    margin: 0,
    padding: "13px",
    borderRadius: "9px",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    fontSize: "16px",
    fontWeight: "bold",
  },

  buttonContainer: {
    display: "flex",
    gap: "15px",
    marginTop: "30px",
  },

  dashboardButton: {
    flex: 1,
    padding: "13px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  logoutButton: {
    flex: 1,
    padding: "13px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Profile;