import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AddMedicine from "../pages/AddMedicine";

describe("MediReminder Add Medicine Page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders the Add Medicine form correctly", () => {
    render(
      <MemoryRouter>
        <AddMedicine />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Add Medicine" })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Medicine Name")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Dosage")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Reminder Time")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Start Date")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("End Date")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Description")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Add Medicine" })
    ).toBeInTheDocument();
  });

  test("shows login message when user is not logged in", () => {
    render(
      <MemoryRouter>
        <AddMedicine />
      </MemoryRouter>
    );

    fireEvent.change(
      screen.getByLabelText("Medicine Name"),
      {
        target: { value: "Paracetamol" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Dosage"),
      {
        target: { value: "500 mg" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Reminder Time"),
      {
        target: { value: "09:00" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Start Date"),
      {
        target: { value: "2026-07-26" },
      }
    );

    fireEvent.change(
      screen.getByLabelText("End Date"),
      {
        target: { value: "2026-07-30" },
      }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Add Medicine" })
    );

    expect(
      screen.getByText("Please log in again.")
    ).toBeInTheDocument();
  });
});