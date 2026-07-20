import { useState } from "react";

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
       localStorage.setItem("token", data.token);
onLoginSuccess();
      } else {
        setMessage(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>MediReminder</h1>

        <p className="subtitle">
          Welcome back! Please login to continue.
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}

        <p className="switch-text">
          Don't have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToRegister}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;