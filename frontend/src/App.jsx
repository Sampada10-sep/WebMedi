import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const savedToken = localStorage.getItem("token");

  const [currentPage, setCurrentPage] = useState(
    savedToken ? "dashboard" : "login"
  );

  const handleLoginSuccess = () => {
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentPage("login");
  };

  if (currentPage === "login") {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setCurrentPage("register")}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <Register onSwitchToLogin={() => setCurrentPage("login")} />
    );
  }

  return (
    <Dashboard
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    />
  );
}

export default App;