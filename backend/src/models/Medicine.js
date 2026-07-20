const pool = require("../config/db");

// Add medicine
const createMedicine = async (
  userId,
  medicineName,
  dosage,
  description,
  reminderTime,
  startDate,
  endDate,
  status
) => {
  const query = `
    INSERT INTO medicines (
      user_id,
      medicine_name,
      dosage,
      description,
      reminder_time,
      start_date,
      end_date,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    userId,
    medicineName,
    dosage,
    description,
    reminderTime,
    startDate,
    endDate,
    status,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// View all medicines
const getAllMedicines = async () => {
  const result = await pool.query(
    "SELECT * FROM medicines ORDER BY created_at DESC"
  );

  return result.rows;
};

// View one medicine
const getMedicineById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM medicines WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

// Update medicine
const updateMedicine = async (
  id,
  medicineName,
  dosage,
  description,
  reminderTime,
  startDate,
  endDate,
  status
) => {
  const query = `
    UPDATE medicines
    SET medicine_name = $1,
        dosage = $2,
        description = $3,
        reminder_time = $4,
        start_date = $5,
        end_date = $6,
        status = $7
    WHERE id = $8
    RETURNING *
  `;

  const values = [
    medicineName,
    dosage,
    description,
    reminderTime,
    startDate,
    endDate,
    status,
    id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete medicine
const deleteMedicine = async (id) => {
  const result = await pool.query(
    "DELETE FROM medicines WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};