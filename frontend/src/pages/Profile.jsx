import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const CHANGE_PASSWORD_URL =
  "https://medireminder-backend-un9x.onrender.com/api/auth/change-password";

function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  const userName =
    localStorage.getItem("user_name") || "User";

  const userEmail =
    localStorage.getItem("user_email") || "Not Available";

  const userId =
    localStorage.getItem("user_id") || "N/A";

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profile_image") || ""
  );

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [showChangePassword, setShowChangePassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  const colors = {
    page: isDark ? "#0f172a" : "#f4f7fb",
    card: isDark ? "#1e293b" : "#ffffff",
    text: isDark ? "#f8fafc" : "#1f2937",
    secondaryText: isDark ? "#cbd5e1" : "#6b7280",
    inputBackground: isDark ? "#334155" : "#f8fafc",
    inputText: isDark ? "#f8fafc" : "#374151",
    border: isDark ? "#475569" : "#d1d5db",
    passwordBox: isDark ? "#273449" : "#f8fafc",
    buttonBackground: isDark ? "#334155" : "#eef2ff",
  };

  const showTemporaryMessage = (
    text,
    type = "success",
    duration = 3000
  ) => {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, duration);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showTemporaryMessage(
        "Please select a valid image file.",
        "error"
      );
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      showTemporaryMessage(
        "Please choose an image smaller than 2 MB.",
        "error"
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageData = reader.result;

      setProfileImage(imageData);
      localStorage.setItem("profile_image", imageData);

      showTemporaryMessage(
        "Profile picture updated successfully."
      );
    };

    reader.onerror = () => {
      showTemporaryMessage(
        "Failed to upload the image.",
        "error"
      );
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    localStorage.removeItem("profile_image");
    setProfileImage("");

    showTemporaryMessage("Profile picture removed.");
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      showTemporaryMessage(
        "Please complete all password fields.",
        "error"
      );
      return;
    }

    if (newPassword.length < 6) {
      showTemporaryMessage(
        "New password must be at least 6 characters long.",
        "error"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showTemporaryMessage(
        "New password and confirm password do not match.",
        "error"
      );
      return;
    }

    if (currentPassword === newPassword) {
      showTemporaryMessage(
        "New password must be different from your current password.",
        "error"
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      showTemporaryMessage(
        "Your session has expired. Please log in again.",
        "error"
      );

      window.setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await fetch(
        CHANGE_PASSWORD_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
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
          data.message || "Failed to change password."
        );
      }

      resetPasswordForm();
      setShowChangePassword(false);

      showTemporaryMessage(
        data.message || "Password changed successfully."
      );
    } catch (error) {
      console.error("Change password error:", error);

      showTemporaryMessage(
        error.message || "Cannot connect to the backend.",
        "error",
        4000
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");

    navigate("/login");
  };

  return (
    <div
      style={{
        ...styles.page,
        backgroundColor: colors.page,
      }}
    >
      <div
        style={{
          ...styles.card,
          backgroundColor: colors.card,
          color: colors.text,
          border: `1px solid ${colors.border}`,
        }}
      >
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
          <div
            style={{
              ...styles.messageBox,
              ...(messageType === "error"
                ? styles.errorMessageBox
                : styles.successMessageBox),
            }}
          >
            {message}
          </div>
        )}

        <div style={styles.infoBox}>
          <label
            style={{
              ...styles.label,
              color: colors.secondaryText,
            }}
          >
            Full Name
          </label>

          <p
            style={{
              ...styles.value,
              backgroundColor: colors.inputBackground,
              color: colors.inputText,
              border: `1px solid ${colors.border}`,
            }}
          >
            {userName}
          </p>
        </div>

        <div style={styles.infoBox}>
          <label
            style={{
              ...styles.label,
              color: colors.secondaryText,
            }}
          >
            Email
          </label>

          <p
            style={{
              ...styles.value,
              backgroundColor: colors.inputBackground,
              color: colors.inputText,
              border: `1px solid ${colors.border}`,
            }}
          >
            {userEmail}
          </p>
        </div>

        <div style={styles.infoBox}>
          <label
            style={{
              ...styles.label,
              color: colors.secondaryText,
            }}
          >
            User ID
          </label>

          <p
            style={{
              ...styles.value,
              backgroundColor: colors.inputBackground,
              color: colors.inputText,
              border: `1px solid ${colors.border}`,
            }}
          >
            {userId}
          </p>
        </div>

        <div style={styles.infoBox}>
          <label
            style={{
              ...styles.label,
              color: colors.secondaryText,
            }}
          >
            Account Status
          </label>

          <p style={styles.activeValue}>Active</p>
        </div>

        <button
          type="button"
          style={{
            ...styles.themeButton,
            backgroundColor: colors.buttonBackground,
            color: isDark ? "#f8fafc" : "#4338ca",
            border: `1px solid ${colors.border}`,
          }}
          onClick={toggleTheme}
        >
          {isDark
            ? "☀️ Switch to Light Mode"
            : "🌙 Switch to Dark Mode"}
        </button>

        <button
          type="button"
          style={{
            ...styles.changePasswordToggle,
            backgroundColor: colors.buttonBackground,
            color: isDark ? "#f8fafc" : "#4338ca",
            border: `1px solid ${colors.border}`,
          }}
          onClick={() => {
            setShowChangePassword(
              (currentValue) => !currentValue
            );

            resetPasswordForm();
            setMessage("");
          }}
        >
          {showChangePassword
            ? "Close Change Password"
            : "Change Password"}
        </button>

        {showChangePassword && (
          <form
            style={{
              ...styles.passwordForm,
              backgroundColor: colors.passwordBox,
              border: `1px solid ${colors.border}`,
            }}
            onSubmit={handleChangePassword}
          >
            <h2
              style={{
                ...styles.passwordTitle,
                color: colors.text,
              }}
            >
              Change Password
            </h2>

            <div style={styles.formGroup}>
              <label
                style={{
                  ...styles.label,
                  color: colors.secondaryText,
                }}
              >
                Current Password
              </label>

              <div style={styles.passwordInputWrapper}>
                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  style={{
                    ...styles.passwordInput,
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    borderColor: colors.border,
                  }}
                />

                <button
                  type="button"
                  style={{
                    ...styles.showPasswordButton,
                    backgroundColor: colors.card,
                    color: isDark ? "#c4b5fd" : "#4f46e5",
                    borderColor: colors.border,
                  }}
                  onClick={() =>
                    setShowCurrentPassword(
                      (currentValue) => !currentValue
                    )
                  }
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label
                style={{
                  ...styles.label,
                  color: colors.secondaryText,
                }}
              >
                New Password
              </label>

              <div style={styles.passwordInputWrapper}>
                <input
                  type={
                    showNewPassword ? "text" : "password"
                  }
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  style={{
                    ...styles.passwordInput,
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    borderColor: colors.border,
                  }}
                />

                <button
                  type="button"
                  style={{
                    ...styles.showPasswordButton,
                    backgroundColor: colors.card,
                    color: isDark ? "#c4b5fd" : "#4f46e5",
                    borderColor: colors.border,
                  }}
                  onClick={() =>
                    setShowNewPassword(
                      (currentValue) => !currentValue
                    )
                  }
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label
                style={{
                  ...styles.label,
                  color: colors.secondaryText,
                }}
              >
                Confirm New Password
              </label>

              <div style={styles.passwordInputWrapper}>
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  style={{
                    ...styles.passwordInput,
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    borderColor: colors.border,
                  }}
                />

                <button
                  type="button"
                  style={{
                    ...styles.showPasswordButton,
                    backgroundColor: colors.card,
                    color: isDark ? "#c4b5fd" : "#4f46e5",
                    borderColor: colors.border,
                  }}
                  onClick={() =>
                    setShowConfirmPassword(
                      (currentValue) => !currentValue
                    )
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.updatePasswordButton,
                ...(isChangingPassword
                  ? styles.disabledButton
                  : {}),
              }}
              disabled={isChangingPassword}
            >
              {isChangingPassword
                ? "Updating Password..."
                : "Update Password"}
            </button>
          </form>
        )}

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
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "35px 20px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    transition: "background-color 0.25s ease",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "18px",
    padding: "35px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.16)",
    boxSizing: "border-box",
    transition:
      "background-color 0.25s ease, color 0.25s ease",
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
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },

  successMessageBox: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
  },

  errorMessageBox: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
  },

  infoBox: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: "bold",
  },

  value: {
    margin: 0,
    padding: "13px",
    borderRadius: "9px",
    fontSize: "16px",
    overflowWrap: "anywhere",
  },

  activeValue: {
    margin: 0,
    padding: "13px",
    borderRadius: "9px",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    fontSize: "16px",
    fontWeight: "bold",
  },

  themeButton: {
    width: "100%",
    marginTop: "5px",
    marginBottom: "15px",
    padding: "13px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  },

  changePasswordToggle: {
    width: "100%",
    padding: "13px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  },

  passwordForm: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "12px",
  },

  passwordTitle: {
    margin: "0 0 20px",
    textAlign: "center",
    fontSize: "21px",
  },

  formGroup: {
    marginBottom: "17px",
  },

  passwordInputWrapper: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
  },

  passwordInput: {
    flex: 1,
    minWidth: 0,
    padding: "12px",
    border: "1px solid",
    borderRight: "none",
    borderRadius: "8px 0 0 8px",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
  },

  showPasswordButton: {
    padding: "0 12px",
    border: "1px solid",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
    fontWeight: "bold",
  },

  updatePasswordButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  },

  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  buttonContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "30px",
  },

  dashboardButton: {
    flex: "1 1 180px",
    padding: "13px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  logoutButton: {
    flex: "1 1 120px",
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