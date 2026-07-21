import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddMedicine from "./pages/AddMedicine";
import MyMedicines from "./pages/MyMedicines";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route
        path="/add-medicine"
        element={<AddMedicine />}
      />

      <Route
        path="/medicines"
        element={<MyMedicines />}
      />

      <Route
        path="/profile"
        element={<h1>Profile page is coming next</h1>}
      />

      <Route
        path="*"
        element={<h1>Page not found</h1>}
      />
    </Routes>
  );
}

export default App;