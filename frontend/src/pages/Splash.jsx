import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/medireminder-logo.png";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <img
          src={logo}
          alt="MediReminder Logo"
          style={styles.logo}
        />

        <h1 style={styles.title}>MediReminder</h1>

        <p style={styles.tagline}>
          Never miss your medicine
        </p>

        <div style={styles.spinner}></div>

        <p style={styles.loadingText}>Loading...</p>
      </div>

      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }

            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #ecfeff 100%)",
    fontFamily: "Arial, sans-serif",
  },

  content: {
    textAlign: "center",
    padding: "30px",
  },

  logo: {
    width: "230px",
    height: "230px",
    objectFit: "contain",
    borderRadius: "50%",
    marginBottom: "15px",
  },

  title: {
    margin: "0",
    fontSize: "42px",
    fontWeight: "700",
    color: "#0f2f63",
  },

  tagline: {
    marginTop: "10px",
    marginBottom: "28px",
    fontSize: "18px",
    color: "#64748b",
  },

  spinner: {
    width: "38px",
    height: "38px",
    margin: "0 auto",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #14b8a6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#64748b",
  },
};

export default Splash;