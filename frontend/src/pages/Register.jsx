import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://medireminder-backend-un9x.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Registration successful! You can now log in."
        );

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(
          data.message || "Registration failed."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Cannot connect to the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          min-height: 100%;
          width: 100%;
        }

        .medi-register-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 35px 20px;
          background: #f4f7fc !important;
          font-family: Arial, Helvetica, sans-serif;
        }

        .medi-register-card {
          width: 100%;
          max-width: 560px;
          background: #ffffff !important;
          border-radius: 22px;
          padding: 42px 38px 32px;
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08);
        }

        .medi-register-title {
          margin: 0;
          text-align: center;
          font-size: 38px;
          font-weight: 700;
          color: #4f46f5 !important;
        }

        .medi-register-subtitle {
          margin: 4px 0 34px;
          text-align: center;
          font-size: 17px;
          color: #64748b !important;
        }

        .medi-register-group {
          margin-bottom: 22px;
        }

        .medi-register-group label {
          display: block;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b !important;
        }

        .medi-input-container {
          position: relative;
          width: 100%;
        }

        .medi-register-input {
          width: 100%;
          height: 54px;
          padding: 0 48px;
          border: 1px solid #d4dce8;
          border-radius: 10px;
          outline: none;
          background: #f7f9fc !important;
          color: #1e293b !important;
          font-size: 16px;
        }

        .medi-register-input::placeholder {
          color: #718096 !important;
          opacity: 1;
        }

        .medi-input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 21px;
          color: #7c8aa5;
          pointer-events: none;
        }

        .medi-eye-button {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent !important;
          color: #718096 !important;
          cursor: pointer;
          font-size: 18px;
        }

        .medi-register-submit {
          width: 100%;
          height: 54px;
          margin-top: 4px;
          border: none;
          border-radius: 9px;
          background: #4f46f5 !important;
          color: #ffffff !important;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
        }

        .medi-register-message {
          margin-top: 18px;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          background: #eef2ff !important;
          color: #3730a3 !important;
          font-size: 14px;
          font-weight: 600;
        }

        .medi-register-login-text {
          margin: 22px 0 0;
          text-align: center;
          color: #64748b !important;
          font-size: 16px;
        }

        .medi-register-login-button {
          border: none;
          background: transparent !important;
          color: #4f46f5 !important;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .medi-register-login-button:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .medi-register-page {
            padding: 18px 12px;
            align-items: flex-start;
          }

          .medi-register-card {
            margin-top: 12px;
            padding: 30px 22px;
            border-radius: 18px;
          }

          .medi-register-title {
            font-size: 31px;
          }
        }
      `}</style>

      <div className="medi-register-page">
        <div className="medi-register-card">

          <h1 className="medi-register-title">
            MediReminder
          </h1>

          <p className="medi-register-subtitle">
            Create your account to get started.
          </p>

          <form onSubmit={handleRegister}>

            <div className="medi-register-group">
              <label>Full Name</label>

              <div className="medi-input-container">
                <span className="medi-input-icon">♙</span>

                <input
                  className="medi-register-input"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="medi-register-group">
              <label>Email</label>

              <div className="medi-input-container">
                <span className="medi-input-icon">✉</span>

                <input
                  className="medi-register-input"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="medi-register-group">
              <label>Password</label>

              <div className="medi-input-container">
                <span className="medi-input-icon">♙</span>

                <input
                  className="medi-register-input"
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="medi-eye-button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "◉" : "◎"}
                </button>
              </div>
            </div>

            <div className="medi-register-group">
              <label>Confirm Password</label>

              <div className="medi-input-container">
                <span className="medi-input-icon">♙</span>

                <input
                  className="medi-register-input"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="medi-eye-button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? "◉" : "◎"}
                </button>
              </div>
            </div>

            <button
              className="medi-register-submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Creating account..."
                : "Register"}
            </button>

          </form>

          {message && (
            <div className="medi-register-message">
              {message}
            </div>
          )}

          <p className="medi-register-login-text">
            Already have an account?{" "}

            <button
              type="button"
              className="medi-register-login-button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>

        </div>
      </div>
    </>
  );
}

export default Register;