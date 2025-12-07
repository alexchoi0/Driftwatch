import { describe, it, expect } from "vitest";
import { checkThreshold, ThresholdConfig } from "@/lib/services/threshold";

describe("checkThreshold", () => {
  describe("sample size requirements", () => {
    it("returns null when baseline has insufficient samples", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        minSampleSize: 5,
      };

      const result = checkThreshold(threshold, 150, [100, 100, 100]); // only 3 samples

      expect(result).toBeNull();
    });

    it("checks threshold when sample size is met", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        minSampleSize: 3,
      };

      const result = checkThreshold(threshold, 150, [100, 100, 100]); // exactly 3 samples

      expect(result).not.toBeNull();
      expect(result?.type).toBe("upper");
    });

    it("checks threshold when sample size is exceeded", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 150, [100, 100, 100, 100]); // 4 samples

      expect(result).not.toBeNull();
    });
  });

  describe("upper boundary violations", () => {
    it("detects upper boundary violation when value increases beyond threshold", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10, // 10% increase triggers alert
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 120, [100, 100]); // 20% increase

      expect(result).not.toBeNull();
      expect(result?.type).toBe("upper");
      expect(result?.percentChange).toBeCloseTo(20);
      expect(result?.baselineValue).toBe(100);
    });

    it("returns null when increase is within upper boundary", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 20,
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 110, [100, 100]); // 10% increase

      expect(result).toBeNull();
    });

    it("returns null when value equals upper boundary exactly", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 110, [100, 100]); // exactly 10% increase

      expect(result).toBeNull();
    });

    it("ignores upper boundary when not set", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: null,
        lowerBoundary: 10,
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 200, [100, 100]); // 100% increase

      expect(result).toBeNull();
    });
  });

  describe("lower boundary violations", () => {
    it("detects lower boundary violation when value decreases beyond threshold", () => {
      const threshold: ThresholdConfig = {
        lowerBoundary: 10, // 10% decrease triggers alert
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 70, [100, 100]); // 30% decrease

      expect(result).not.toBeNull();
      expect(result?.type).toBe("lower");
      expect(result?.percentChange).toBeCloseTo(-30);
      expect(result?.baselineValue).toBe(100);
    });

    it("returns null when decrease is within lower boundary", () => {
      const threshold: ThresholdConfig = {
        lowerBoundary: 20,
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 90, [100, 100]); // 10% decrease

      expect(result).toBeNull();
    });

    it("ignores lower boundary when not set", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        lowerBoundary: null,
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 50, [100, 100]); // 50% decrease

      expect(result).toBeNull();
    });
  });

  describe("baseline calculation", () => {
    it("calculates baseline as average of all values", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        minSampleSize: 3,
      };

      // Baseline average = (90 + 100 + 110) / 3 = 100
      // New value = 120, percent change = 20%
      const result = checkThreshold(threshold, 120, [90, 100, 110]);

      expect(result).not.toBeNull();
      expect(result?.baselineValue).toBe(100);
      expect(result?.percentChange).toBeCloseTo(20);
    });

    it("handles varying baseline values correctly", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 5,
        minSampleSize: 4,
      };

      // Baseline average = (80 + 90 + 100 + 130) / 4 = 100
      const result = checkThreshold(threshold, 110, [80, 90, 100, 130]);

      expect(result?.baselineValue).toBe(100);
      expect(result?.percentChange).toBeCloseTo(10);
    });
  });

  describe("edge cases", () => {
    it("returns null when baseline average is zero", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 100, [0, 0]);

      expect(result).toBeNull();
    });

    it("handles negative values", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        lowerBoundary: 10,
        minSampleSize: 2,
      };

      // Baseline = -100, new value = -150 (50% decrease in absolute terms)
      // Percent change = ((-150) - (-100)) / (-100) * 100 = 50%
      const result = checkThreshold(threshold, -150, [-100, -100]);

      expect(result).not.toBeNull();
      expect(result?.type).toBe("upper"); // Value went "up" (more negative = worse performance)
      expect(result?.percentChange).toBeCloseTo(50);
    });

    it("handles decimal values", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 5,
        minSampleSize: 2,
      };

      const result = checkThreshold(threshold, 1.15, [1.0, 1.0]); // 15% increase

      expect(result).not.toBeNull();
      expect(result?.percentChange).toBeCloseTo(15);
    });

    it("handles empty baseline array", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        minSampleSize: 0,
      };

      // Even with minSampleSize=0, empty array has length 0
      const result = checkThreshold(threshold, 100, []);

      expect(result).toBeNull();
    });
  });

  describe("combined boundaries", () => {
    it("checks both boundaries when both are set", () => {
      const threshold: ThresholdConfig = {
        upperBoundary: 10,
        lowerBoundary: 10,
        minSampleSize: 2,
      };

      const upperViolation = checkThreshold(threshold, 120, [100, 100]);
      expect(upperViolation?.type).toBe("upper");

      const lowerViolation = checkThreshold(threshold, 80, [100, 100]);
      expect(lowerViolation?.type).toBe("lower");

      const noViolation = checkThreshold(threshold, 105, [100, 100]);
      expect(noViolation).toBeNull();
    });
  });
});
