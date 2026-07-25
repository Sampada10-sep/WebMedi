process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../src/server");

describe("MediReminder Backend API", () => {

  // TEST 1: Backend
  test("GET / should return backend running message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);

    expect(response.body.message).toBe(
      "MediReminder backend is running"
    );
  });


  // TEST 2: Register - missing fields
  test("POST /api/auth/register should reject missing fields", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "123456",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Name, email and password are required"
    );
  });


  // TEST 3: Register - short password
  test("POST /api/auth/register should reject short password", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Password must be at least 6 characters long"
    );
  });


  // TEST 4: Login - missing password
  test("POST /api/auth/login should reject missing password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Email and password are required"
    );
  });


  // TEST 5: Add medicine - missing required fields
  test("POST /api/medicines should reject missing fields", async () => {
    const response = await request(app)
      .post("/api/medicines")
      .send({
        user_id: 1,
        medicine_name: "Paracetamol",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "User ID, medicine name, dosage, reminder time, start date and end date are required"
    );
  });


  // TEST 6: Update medicine - missing required fields
  test("PUT /api/medicines/:id should reject missing fields", async () => {
    const response = await request(app)
      .put("/api/medicines/1")
      .send({
        medicine_name: "Paracetamol",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Medicine name, dosage, reminder time, start date and end date are required"
    );
  });

});