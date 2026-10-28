"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components";
import { AlertCircleIcon, TrendingUpIcon, LayersIcon, ZapIcon } from "@/components/Icons";
import { useApi } from "@/lib/client/api";
import { getRuleTypeLabel, type RuleType } from "@/lib/review-engine";
import type { ReviewListItem, BrandWithCounts } from "@/backend";

interface RuleViolation {
  ruleStableId: string;
  ruleName: string;
  count: number;
  severity: "error" | "warning";
  ruleType: RuleType;
}

interface CategoryStat {
  category: string;
  violations: number;
  percentage: number;
}

export default function BrandRadarPage() {
  const reviews = useApi<ReviewListItem[]>("/api/reviews?limit=50");
  const brands = useApi<BrandWithCounts[]>("/api/brands");

  // Calculate metrics from review history
  const metrics = useMemo(() => {
    if (reviews.state.status !== "ready") {
      return {
        totalReviews: 0,
        reviewsWithFindings: 0,
        mostViolatedRules: [] as RuleViolation[],
        categoryStats: [] as CategoryStat[],
        recentTrend: 0,
      };
    }

    const reviewData = reviews.state.data;
    const totalReviews = reviewData.length;
    const reviewsWithFindings = reviewData.filter(
      (r) => r.outcome === "findings_require_review"
    ).length;

    // Track rule violations (would need full review data with findings)
    // For now, use summary counts as a proxy
    const ruleViolations = new Map<string, number>();
    
    reviewData.forEach((review) => {
      if (review.summary.total > 0) {
        // This is simplified - in production you'd fetch full review details
        // For now we'll show aggregate stats
      }
    });

    // Calculate trend (last 10 vs previous 10)
    const recent = reviewData.slice(0, Math.min(10, reviewData.length));
    const previous = reviewData.slice(10, Math.min(20, reviewData.length));
    
    const recentFindingsRate = recent.length > 0
      ? recent.filter((r) => r.outcome === "findings_require_review").length / recent.length
      : 0;
    const previousFindingsRate = previous.length > 0
      ? previous.filter((r) => r.outcome === "findings_require_review").length / previous.length
      : 0;
    
    const recentTrend = previousFindingsRate > 0
      ? ((recentFindingsRate - previousFindingsRate) / previousFindingsRate) * 100
      : 0;

    return {
      totalReviews,
      reviewsWithFindings,
      mostViolatedRules: [] as RuleViolation[],
      categoryStats: [] as CategoryStat[],
      recentTrend: Math.round(recentTrend),
    };
  }, [reviews.state]);

  const complianceRate = metrics.totalReviews > 0
    ? Math.round(((metrics.totalReviews - metrics.reviewsWithFindings) / metrics.totalReviews) * 100)
    : 0;

  if (reviews.state.status === "loading") {
    return <div className="animate-pulse">Loading metrics...</div>;
  }

  if (metrics.totalReviews === 0) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Analytics</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Brand Drift Radar</h1>
          <p className="mt-1 text-sm text-muted">Track recurring brand consistency issues</p>
        </header>

        <Card variant="elevated">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/20">
              <TrendingUpIcon className="h-8 w-8 text-muted" ariaHidden />
            </div>
            <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">No data yet</h2>
            <p className="mb-6 text-sm text-muted">
              Start reviewing content to see brand consistency trends and violation patterns.
            </p>
            <Link
              href="/dashboard/content-review"
              className="inline-flex rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
            >
              Review your first content
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Analytics</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Brand Drift Radar</h1>
        <p className="mt-1 text-sm text-muted">
          Insights from {metrics.totalReviews} review{metrics.totalReviews === 1 ? "" : "s"}
        </p>
      </header>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{metrics.totalReviews}</p>
                <p className="text-sm text-muted">Total Reviews</p>
              </div>
              <LayersIcon className="h-10 w-10 text-accent/30" ariaHidden />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{complianceRate}%</p>
                <p className="text-sm text-muted">Compliance Rate</p>
              </div>
              <ZapIcon className="h-10 w-10 text-success/30" ariaHidden />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{metrics.reviewsWithFindings}</p>
                <p className="text-sm text-muted">With Findings</p>
              </div>
              <AlertCircleIcon className="h-10 w-10 text-warning/30" ariaHidden />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${metrics.recentTrend > 0 ? "text-error" : "text-success"}`}>
                  {metrics.recentTrend > 0 ? "+" : ""}{metrics.recentTrend}%
                </p>
                <p className="text-sm text-muted">Recent Trend</p>
              </div>
              <TrendingUpIcon
                className={`h-10 w-10 ${metrics.recentTrend > 0 ? "text-error/30" : "text-success/30"}`}
                ariaHidden
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Violated Rules */}
      <Card variant="elevated">
        <CardHeader
          title="Most Violated Rules"
          description="Rules that frequently trigger across reviews"
        />
        <CardContent>
          {metrics.mostViolatedRules.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted">
                Detailed rule violation tracking requires individual review analysis.
                This feature will show the most commonly triggered rules once enough data is collected.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.mostViolatedRules.map((violation) => (
                <div
                  key={violation.ruleStableId}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{violation.ruleName}</p>
                    <p className="text-sm text-muted">{getRuleTypeLabel(violation.ruleType)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{violation.count}</p>
                    <p className="text-xs text-muted">violations</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader
            title="Violations by Category"
            description="Distribution of issues across rule types"
          />
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Category analysis will be available once review history includes detailed finding data.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader
            title="Recent Activity"
            description="Last 10 reviews"
          />
          <CardContent>
            <div className="space-y-3">
              {reviews.state.status === "ready" &&
                reviews.state.data.slice(0, 10).map((review) => (
                  <Link
                    key={review.id}
                    href={`/dashboard/review-history/${review.id}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/30 hover:shadow-md"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{review.brandName}</p>
                      <p className="text-xs text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {review.outcome === "no_rules_triggered" ? (
                        <span className="text-xs font-medium text-success">✓ Pass</span>
                      ) : (
                        <span className="text-xs font-medium text-warning">
                          {review.summary.total} finding{review.summary.total === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Insights */}
      <Card variant="elevated">
        <CardHeader
          title="Recommendations"
          description="Actions to improve brand consistency"
        />
        <CardContent>
          <div className="space-y-4">
            {complianceRate < 70 && (
              <div className="rounded-lg border-l-4 border-warning bg-warning-bg p-4">
                <p className="font-medium text-foreground">Low compliance rate detected</p>
                <p className="mt-1 text-sm text-muted">
                  Review your brand guidelines and ensure rules accurately reflect your standards.
                </p>
                <Link
                  href="/dashboard/brand-guidelines"
                  className="mt-3 inline-flex text-sm font-medium text-accent hover:text-accent-hover"
                >
                  Review guidelines →
                </Link>
              </div>
            )}
            
            {metrics.recentTrend > 10 && (
              <div className="rounded-lg border-l-4 border-error bg-error-bg p-4">
                <p className="font-medium text-foreground">Increasing violation trend</p>
                <p className="mt-1 text-sm text-muted">
                  Recent content shows more issues. Consider team training or guideline updates.
                </p>
              </div>
            )}

            {complianceRate >= 90 && (
              <div className="rounded-lg border-l-4 border-success bg-success-bg p-4">
                <p className="font-medium text-foreground">Excellent brand consistency!</p>
                <p className="mt-1 text-sm text-muted">
                  Your content maintains high compliance with brand guidelines.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
