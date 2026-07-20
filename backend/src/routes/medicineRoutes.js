const express = require("express");

const {
  addMedicine,
  viewMedicines,
  viewMedicineById,
  editMedicine,
  removeMedicine,
} = require("../controllers/medicineController");

const router = express.Router();

// Add medicine
router.post("/", addMedicine);

// View all medicines
router.get("/", viewMedicines);

// View one medicine
router.get("/:id", viewMedicineById);

// Update medicine
router.put("/:id", editMedicine);

// Delete medicine
router.delete("/:id", removeMedicine);

module.exports = router;