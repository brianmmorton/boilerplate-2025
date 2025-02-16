import React from "react";
import { render, screen } from "@testing-library/react";
import Boilerplate from "./Boilerplate";

test("renders learn react link", () => {
  render(<Boilerplate />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
