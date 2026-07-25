import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register";

describe("MediReminder Register Page", () => {
  test("renders the register page correctly", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "MediReminder" })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your full name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your email address")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Confirm your password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();
  });

  test("shows an error when passwords do not match", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your full name"),
      {
        target: { value: "Test User" },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your email address"),
      {
        target: { value: "test@example.com" },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your password"),
      {
        target: { value: "123456" },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Confirm your password"),
      {
        target: { value: "654321" },
      }
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      screen.getByText("Passwords do not match.")
    ).toBeInTheDocument();
  });
});