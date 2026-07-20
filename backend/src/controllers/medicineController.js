const Medicine = require("../models/Medicine");

// Add medicine
const addMedicine = async (req, res) => {
  try {
    const {
      user_id,
      medicine_name,
      dosage,
      description,
      reminder_time,
      start_date,
      end_date,
      status,
    } = req.body;

    if (
      !user_id ||
      !medicine_name ||
      !dosage ||
      !reminder_time ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        message:
          "User ID, medicine name, dosage, reminder time, start date and end date are required",
      });
    }

    const medicine = await Medicine.createMedicine(
      user_id,
      medicine_name,
      dosage,
      description || "",
      reminder_time,
      start_date,
      end_date,
      status || "Active"
    );

    res.status(201).json({
      message: "Medicine added successfully",
      medicine,
    });
  } catch (error) {
    console.error("Add medicine error:", error.message);

    res.status(500).json({
      message: "Failed to add medicine",
      error: error.message,
    });
  }
};

// View all medicines
const viewMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.getAllMedicines();

    res.status(200).json({
      message: "Medicines retrieved successfully",
      medicines,
    });
  } catch (error) {
    console.error("View medicines error:", error.message);

    res.status(500).json({
      message: "Failed to retrieve medicines",
      error: error.message,
    });
  }
};

// View one medicine
const viewMedicineById = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.getMedicineById(id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      medicine,
    });
  } catch (error) {
    console.error("View medicine error:", error.message);

    res.status(500).json({
      message: "Failed to retrieve medicine",
      error: error.message,
    });
  }
};

// Update medicine
const editMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      medicine_name,
      dosage,
      description,
      reminder_time,
      start_date,
      end_date,
      status,
    } = req.body;

    if (
      !medicine_name ||
      !dosage ||
      !reminder_time ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        message:
          "Medicine name, dosage, reminder time, start date and end date are required",
      });
    }

    const medicine = await Medicine.updateMedicine(
      id,
      medicine_name,
      dosage,
      description || "",
      reminder_time,
      start_date,
      end_date,
      status || "Active"
    );

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      message: "Medicine updated successfully",
      medicine,
    });
  } catch (error) {
    console.error("Update medicine error:", error.message);

    res.status(500).json({
      message: "Failed to update medicine",
      error: error.message,
    });
  }
};

// Delete medicine
const removeMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.deleteMedicine(id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      message: "Medicine deleted successfully",
      medicine,
    });
  } catch (error) {
    console.error("Delete medicine error:", error.message);

    res.status(500).json({
      message: "Failed to delete medicine",
      error: error.message,
    });
  }
};

module.exports = {
  addMedicine,
  viewMedicines,
  viewMedicineById,
  editMedicine,
  removeMedicine,
};