import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EditMedicine from "../pages/EditMedicine";

describe("MediReminder Edit Medicine Page", () => {
  beforeEach(() => {
    localStorage.clear();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            medicine: {
              id: 1,
              medicine_name: "Paracetamol",
              dosage: "500 mg",
              reminder_time: "09:00:00",
              start_date: "2026-07-26",
              end_date: "2026-07-30",
              description: "Take after food",
              status: "Active",
            },
          }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("loads and displays medicine details correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/edit-medicine/1"]}>
        <Routes>
          <Route
            path="/edit-medicine/:id"
            element={<EditMedicine />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Loading medicine...")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Edit Medicine" })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText("Medicine Name")
    ).toHaveValue("Paracetamol");

    expect(
      screen.getByLabelText("Dosage")
    ).toHaveValue("500 mg");

    expect(
      screen.getByLabelText("Reminder Time")
    ).toHaveValue("09:00");

    expect(
      screen.getByLabelText("Description")
    ).toHaveValue("Take after food");

    expect(
      screen.getByLabelText("Status")
    ).toHaveValue("Active");

    expect(
      screen.getByRole("button", { name: "Update Medicine" })
    ).toBeInTheDocument();
  });
});