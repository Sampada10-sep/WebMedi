import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";
import MyMedicines from "../pages/MyMedicines";

const testMedicines = [
  {
    id: 1,
    medicine_name: "Paracetamol",
    dosage: "500 mg",
    reminder_time: "09:00:00",
    start_date: "2026-07-26",
    end_date: "2026-07-30",
    description: "Take after food",
    status: "Active",
  },
  {
    id: 2,
    medicine_name: "Vitamin D",
    dosage: "1000 IU",
    reminder_time: "10:00:00",
    start_date: "2026-07-26",
    end_date: "2026-08-26",
    description: "Take once daily",
    status: "Active",
  },
];

describe("MediReminder My Medicines Page", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            medicines: testMedicines,
          }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TEST 1
  test("loads and displays medicines", async () => {
    render(
      <MemoryRouter>
        <MyMedicines />
      </MemoryRouter>
    );

    expect(
      screen.getAllByText("Loading medicines...").length
    ).toBeGreaterThan(0);

    await waitFor(() => {
      expect(
        screen.getByText("Paracetamol")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Vitamin D")
    ).toBeInTheDocument();

    expect(
      screen.getByText("500 mg")
    ).toBeInTheDocument();

    expect(
      screen.getByText("1000 IU")
    ).toBeInTheDocument();
  });

  // TEST 2
  test("searches medicines correctly", async () => {
    render(
      <MemoryRouter>
        <MyMedicines />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Paracetamol")
      ).toBeInTheDocument();
    });

    const searchBox =
      screen.getByPlaceholderText(
        "Search medicine, dosage or description..."
      );

    fireEvent.change(searchBox, {
      target: {
        value: "Vitamin",
      },
    });

    expect(
      screen.getByText("Vitamin D")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Paracetamol")
    ).not.toBeInTheDocument();
  });

  // TEST 3
  test("deletes a medicine successfully", async () => {
    global.fetch = jest
      .fn()

      // First fetch: load medicines
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          medicines: testMedicines,
        }),
      })

      // Second fetch: delete medicine
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message:
            "Medicine deleted successfully",
        }),
      });

    render(
      <MemoryRouter>
        <MyMedicines />
      </MemoryRouter>
    );

    // Wait for medicines to load
    await waitFor(() => {
      expect(
        screen.getByText("Paracetamol")
      ).toBeInTheDocument();
    });

    // There is one Delete button for each medicine.
    const deleteButtons =
      screen.getAllByRole("button", {
        name: "Delete",
      });

    // Click Delete for Paracetamol
    fireEvent.click(deleteButtons[0]);

    // Confirmation modal should appear
    expect(
      screen.getByRole("heading", {
        name: "Delete Medicine",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Are you sure you want to delete this medicine/i
      )
    ).toBeInTheDocument();

    // Now there are card Delete buttons plus
    // the confirmation Delete button.
    const confirmationButtons =
      screen.getAllByRole("button", {
        name: "Delete",
      });

    fireEvent.click(
      confirmationButtons[
        confirmationButtons.length - 1
      ]
    );

    // Paracetamol should disappear
    await waitFor(() => {
      expect(
        screen.queryByText("Paracetamol")
      ).not.toBeInTheDocument();
    });

    // Vitamin D should remain
    expect(
      screen.getByText("Vitamin D")
    ).toBeInTheDocument();

    // Success message should appear
    expect(
      screen.getByText(
        "Medicine deleted successfully."
      )
    ).toBeInTheDocument();

    // Verify DELETE request was made
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/medicines/1"
      ),
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });
});