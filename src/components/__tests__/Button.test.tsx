import { render, screen } from "@testing-library/react";
import { Button } from "../ui/Button";
import { axe } from "vitest-axe";
import { describe, it, expect } from "vitest";

describe("Button Component", () => {
  it("renders correctly with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600");
  });

  it("applies secondary variant when specified", () => {
    render(<Button variant="secondary">Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gray-200");
  });

  it("should have no accessibility violations", async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
