import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders button with text", () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("renders with data-slot attribute", () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
    });

    it("renders children correctly", () => {
      render(
        <Button>
          <span data-testid="icon">*</span>
          Label
        </Button>
      );

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("Label")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("applies default variant classes", () => {
      render(<Button>Default</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary");
      expect(button).toHaveClass("text-primary-foreground");
    });

    it("applies destructive variant classes", () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive");
    });

    it("applies outline variant classes", () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("border");
      expect(button).toHaveClass("bg-background");
    });

    it("applies secondary variant classes", () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-secondary");
    });

    it("applies ghost variant classes", () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent");
    });

    it("applies link variant classes", () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-primary");
      expect(button).toHaveClass("underline-offset-4");
    });
  });

  describe("sizes", () => {
    it("applies default size classes", () => {
      render(<Button>Default Size</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9");
    });

    it("applies small size classes", () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8");
    });

    it("applies large size classes", () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10");
    });

    it("applies icon size classes", () => {
      render(<Button size="icon">*</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("size-9");
    });
  });

  describe("interactions", () => {
    it("handles click events", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole("button"));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not fire click when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      await user.click(screen.getByRole("button"));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("applies disabled styles", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:opacity-50");
    });
  });

  describe("custom props", () => {
    it("applies custom className", () => {
      render(<Button className="custom-class">Custom</Button>);

      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });

    it("passes through HTML button attributes", () => {
      render(
        <Button type="submit" name="submit-btn" aria-label="Submit form">
          Submit
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("name", "submit-btn");
      expect(button).toHaveAttribute("aria-label", "Submit form");
    });
  });

  describe("asChild prop", () => {
    it("renders as anchor when asChild is true with anchor child", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole("link", { name: "Link Button" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
      expect(link).toHaveAttribute("data-slot", "button");
    });
  });
});
