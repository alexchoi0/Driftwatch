import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const result = cn("base", true && "active", false && "inactive");
    expect(result).toBe("base active");
  });

  it("handles array of classes", () => {
    const result = cn(["foo", "bar"]);
    expect(result).toBe("foo bar");
  });

  it("handles undefined and null values", () => {
    const result = cn("base", undefined, null, "end");
    expect(result).toBe("base end");
  });

  it("merges conflicting Tailwind classes correctly", () => {
    // twMerge should resolve conflicting classes
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("merges responsive variants correctly", () => {
    const result = cn("text-sm", "md:text-lg", "text-base");
    expect(result).toBe("md:text-lg text-base");
  });

  it("handles object syntax", () => {
    const result = cn({ active: true, disabled: false });
    expect(result).toBe("active");
  });

  it("returns empty string for no arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
