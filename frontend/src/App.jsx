import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddMedicine from "./pages/AddMedicine";
import MyMedicines from "./pages/MyMedicines";
import EditMedicine from "./pages/EditMedicine";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/add-medicine"
        element={<AddMedicine />}
      />

      <Route
        path="/medicines"
        element={<MyMedicines />}
      />

      <Route
        path="/edit-medicine/:id"
        element={<EditMedicine />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

      <Route
        path="*"
        element={<h1>Page not found</h1>}
      />
    </Routes>
  );
}

export default App;