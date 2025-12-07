export interface ThresholdConfig {
  upperBoundary?: number | null;
  lowerBoundary?: number | null;
  minSampleSize: number;
}

export interface ThresholdViolation {
  baselineValue: number;
  percentChange: number;
  type: "upper" | "lower";
}

/**
 * Check if a new metric value violates a threshold based on baseline values.
 *
 * @param threshold - The threshold configuration
 * @param newValue - The new metric value to check
 * @param baselineValues - Historical values to compute the baseline average
 * @returns A violation object if threshold is exceeded, null otherwise
 */
export function checkThreshold(
  threshold: ThresholdConfig,
  newValue: number,
  baselineValues: number[]
): ThresholdViolation | null {
  // Need enough samples to establish a baseline
  if (baselineValues.length < threshold.minSampleSize) {
    return null;
  }

  // Calculate baseline average
  const baselineAvg =
    baselineValues.reduce((sum, val) => sum + val, 0) / baselineValues.length;

  // Avoid division by zero
  if (baselineAvg === 0) {
    return null;
  }

  // Calculate percent change from baseline
  const percentChange = ((newValue - baselineAvg) / baselineAvg) * 100;

  // Check upper boundary (performance regression - value increased)
  if (
    threshold.upperBoundary != null &&
    percentChange > threshold.upperBoundary
  ) {
    return {
      baselineValue: baselineAvg,
      percentChange,
      type: "upper",
    };
  }

  // Check lower boundary (unexpected improvement or regression depending on metric)
  // Note: lowerBoundary is compared against negative percent change
  if (
    threshold.lowerBoundary != null &&
    percentChange < -threshold.lowerBoundary
  ) {
    return {
      baselineValue: baselineAvg,
      percentChange,
      type: "lower",
    };
  }

  return null;
}
