import React from "react";
import { render, screen } from "@testing-library/react";
import { ScoutSense } from "./Boilerplate";

test("renders learn react link", () => {
  render(<ScoutSense />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
