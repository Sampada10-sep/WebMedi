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
        <div style={styles.logoWrapper}>
          <img
            src={logo}
            alt="MediReminder Logo"
            style={styles.logo}
          />
        </div>

        <h1 style={styles.title}>MediReminder</h1>

        <p style={styles.tagline}>
          Never miss your medicine
        </p>

        <div style={styles.spinner}></div>

        <p style={styles.loadingText}>
          Loading...
        </p>
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

          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(15px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
            }

            50% {
              transform: scale(1.03);
            }

            100% {
              transform: scale(1);
            }
          }

          @media (max-width: 600px) {
            .splash-logo-wrapper {
              width: 280px !important;
            }

            .splash-title {
              font-size: 36px !important;
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
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #ecfeff 100%)",
    fontFamily: "Arial, sans-serif",
    overflow: "hidden",
  },

  content: {
    width: "100%",
    maxWidth: "650px",
    padding: "30px 20px",
    textAlign: "center",
    animation: "fadeIn 0.8s ease-in-out",
  },

  logoWrapper: {
    width: "360px",
    maxWidth: "90vw",
    margin: "0 auto 18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    animation: "pulse 2s ease-in-out infinite",
  },

  logo: {
    width: "100%",
    height: "auto",
    display: "block",
    objectFit: "contain",
  },

  title: {
    margin: "0",
    fontSize: "46px",
    fontWeight: "700",
    lineHeight: "1.15",
    color: "#0f2f63",
  },

  tagline: {
    marginTop: "8px",
    marginBottom: "28px",
    fontSize: "19px",
    color: "#64748b",
  },

  spinner: {
    width: "40px",
    height: "40px",
    margin: "0 auto",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #14b8a6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "12px",
    marginBottom: "0",
    fontSize: "14px",
    color: "#64748b",
  },
};

export default Splash;