import { Routes, Route } from "react-router-dom";

import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyMedicines from "./pages/MyMedicines";
import AddMedicine from "./pages/AddMedicine";
import EditMedicine from "./pages/EditMedicine";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/medicines" element={<MyMedicines />} />
      <Route path="/add-medicine" element={<AddMedicine />} />
      <Route
        path="/edit-medicine/:id"
        element={<EditMedicine />}
      />
    </Routes>
  );
}

export default App;