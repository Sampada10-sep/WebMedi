import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://medireminder-backend-un9x.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const user = data.user;

        if (!user) {
          setMessage("User information was not returned by the backend.");
          return;
        }

        const userName =
          user.name ||
          user.full_name ||
          user.fullName ||
          "User";

        localStorage.setItem("token", data.token || "");
        localStorage.setItem("user_id", String(user.id || ""));
        localStorage.setItem("user_name", userName);
        localStorage.setItem("user_email", user.email || email);

        navigate("/dashboard");
      } else {
        setMessage(
          data.message || "Invalid email or password."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Cannot connect to the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>MediReminder</h1>

        <p style={styles.subtitle}>
          Welcome back! Please login to continue.
        </p>

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.loginButton,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p style={styles.message}>{message}</p>
        )}

        <p style={styles.switchText}>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            style={styles.linkButton}
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>
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
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "#ffffff",
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  },

  title: {
    margin: 0,
    textAlign: "center",
    color: "#4f46e5",
    fontSize: "32px",
  },

  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "28px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },

  label: {
    marginBottom: "8px",
    color: "#374151",
    fontWeight: "bold",
  },

  input: {
    padding: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    fontSize: "16px",
    outline: "none",
  },

  loginButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
  },

  message: {
    marginTop: "16px",
    textAlign: "center",
    color: "#dc2626",
  },

  switchText: {
    marginTop: "22px",
    textAlign: "center",
    color: "#6b7280",
  },

  linkButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#4f46e5",
    fontWeight: "bold",
    cursor: "pointer",
    padding: 0,
  },
};

export default Login;