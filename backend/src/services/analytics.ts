import type { ReviewRun, ReviewListItem } from "../store/types.ts";

export interface DailyConsistency {
  date: string; // YYYY-MM-DD
  totalReviews: number;
  passingReviews: number;
  consistencyScore: number; // 0-100
}

export interface RuleViolation {
  ruleStableId: string;
  ruleName: string;
  ruleType: string;
  severity: "error" | "warning";
  violationCount: number;
}

export interface OutcomeDistribution {
  passed: number;
  failed: number;
  total: number;
}

export interface AnalyticsData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  overallConsistencyScore: number | null; // null when no reviews
  dailyTrend: DailyConsistency[];
  ruleViolations: RuleViolation[];
  outcomeDistribution: OutcomeDistribution;
  totalReviews: number;
  totalViolations: number;
}

/**
 * Calculate analytics from review data.
 * 
 * Consistency score = (reviews with no findings / total reviews) * 100
 * Days without reviews are represented as gaps (not zero).
 */
export function calculateAnalytics(
  reviews: ReviewRun[],
  startDate: Date,
  endDate: Date
): AnalyticsData {
  if (reviews.length === 0) {
    return {
      dateRange: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      overallConsistencyScore: null,
      dailyTrend: [],
      ruleViolations: [],
      outcomeDistribution: { passed: 0, failed: 0, total: 0 },
      totalReviews: 0,
      totalViolations: 0,
    };
  }

  // Overall consistency score
  const passingReviews = reviews.filter((r) => r.outcome === "no_rules_triggered").length;
  const overallConsistencyScore = (passingReviews / reviews.length) * 100;

  // Group reviews by date
  const reviewsByDate = new Map<string, ReviewRun[]>();
  for (const review of reviews) {
    const date = new Date(review.createdAt).toISOString().split("T")[0];
    if (!reviewsByDate.has(date)) {
      reviewsByDate.set(date, []);
    }
    reviewsByDate.get(date)!.push(review);
  }

  // Calculate daily consistency
  const dailyTrend: DailyConsistency[] = [];
  for (const [date, dayReviews] of reviewsByDate.entries()) {
    const dayPassing = dayReviews.filter((r) => r.outcome === "no_rules_triggered").length;
    dailyTrend.push({
      date,
      totalReviews: dayReviews.length,
      passingReviews: dayPassing,
      consistencyScore: (dayPassing / dayReviews.length) * 100,
    });
  }
  dailyTrend.sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate rule violations
  const violationMap = new Map<string, { name: string; type: string; severity: "error" | "warning"; count: number }>();
  for (const review of reviews) {
    for (const finding of review.findings) {
      const existing = violationMap.get(finding.ruleStableId);
      if (existing) {
        existing.count += 1;
      } else {
        // Get rule name from snapshot
        const rule = review.ruleSnapshot.find((r) => r.stableId === finding.ruleStableId);
        violationMap.set(finding.ruleStableId, {
          name: rule?.name ?? finding.ruleStableId,
          type: finding.ruleType,
          severity: finding.severity,
          count: 1,
        });
      }
    }
  }

  const ruleViolations: RuleViolation[] = Array.from(violationMap.entries())
    .map(([ruleStableId, data]) => ({
      ruleStableId,
      ruleName: data.name,
      ruleType: data.type,
      severity: data.severity,
      violationCount: data.count,
    }))
    .sort((a, b) => b.violationCount - a.violationCount)
    .slice(0, 10); // Top 10

  // Outcome distribution
  const failed = reviews.filter((r) => r.outcome === "findings_require_review").length;
  const outcomeDistribution: OutcomeDistribution = {
    passed: passingReviews,
    failed,
    total: reviews.length,
  };

  // Total violations
  const totalViolations = reviews.reduce((sum, r) => sum + r.summary.total, 0);

  return {
    dateRange: {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    },
    overallConsistencyScore: Math.round(overallConsistencyScore * 10) / 10, // Round to 1 decimal
    dailyTrend,
    ruleViolations,
    outcomeDistribution,
    totalReviews: reviews.length,
    totalViolations,
  };
}
