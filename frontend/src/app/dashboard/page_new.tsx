"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components";
import { DemoPill, ErrorBanner, LoadingLine, OutcomeBadge } from "@/components/review/ReviewParts";
import { useApi } from "@/lib/client/api";
import { KPICard } from "@/components/dashboard/KPICard";
import { DateRangeSelector } from "@/components/dashboard/DateRangeSelector";
import { ConsistencyTrendChart } from "@/components/charts/ConsistencyTrendChart";
import { RuleViolationsChart } from "@/components/charts/RuleViolationsChart";
import { OutcomeDistributionChart } from "@/components/charts/OutcomeDistributionChart";
import { ShieldCheckIcon, FileTextIcon, AlertCircleIcon, ZapIcon } from "@/components/Icons";
import type { ReviewListItem, Summary } from "@/backend";
import type { AnalyticsData } from "@/backend";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState(30);
  
  const summary = useApi<Summary>("/api/summary");
  const analytics = useApi<AnalyticsData>(`/api/analytics?days=${dateRange}`);
  const recent = useApi<ReviewListItem[]>("/api/reviews?limit=10");

  const analyticsData = analytics.state.status === "ready" ? analytics.state.data : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Brand Intelligence</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Analytics and insights from validation results. Local demo environment: no sign-in, one shared workspace.
        </p>
      </header>

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
        <Link
          href="/dashboard/content-review"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          New Review
        </Link>
      </div>

      {/* KPI Cards */}
      <section aria-label="Key Metrics">
        {summary.state.status === "loading" && <LoadingLine label="Loading metrics…" />}
        {summary.state.status === "error" && (
          <ErrorBanner error={summary.state.error} onRetry={summary.reload} title="Could not load metrics" />
        )}
        {summary.state.status === "ready" && analyticsData && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              label="Brand Consistency"
              value={
                analyticsData.overallConsistencyScore !== null
                  ? `${analyticsData.overallConsistencyScore.toFixed(1)}%`
                  : "N/A"
              }
              subtitle={
                analyticsData.overallConsistencyScore !== null
                  ? `${analyticsData.outcomeDistribution.passed} of ${analyticsData.totalReviews} passing`
                  : "No reviews in period"
              }
              icon={<ShieldCheckIcon className="h-5 w-5 text-accent" ariaHidden />}
              href="/dashboard/review-history"
            />
            <KPICard
              label="Reviews Completed"
              value={analyticsData.totalReviews}
              subtitle={`Last ${dateRange} days`}
              icon={<FileTextIcon className="h-5 w-5 text-accent" ariaHidden />}
              href="/dashboard/review-history"
            />
            <KPICard
              label="Rule Violations"
              value={analyticsData.totalViolations}
              subtitle={`${analyticsData.ruleViolations.length} rules triggered`}
              icon={<AlertCircleIcon className="h-5 w-5 text-accent" ariaHidden />}
              href="/dashboard/brand-guidelines"
            />
            <KPICard
              label="Needs Attention"
              value={analyticsData.outcomeDistribution.failed}
              subtitle="Reviews with findings"
              icon={<ZapIcon className="h-5 w-5 text-accent" ariaHidden />}
              href="/dashboard/review-history"
            />
          </div>
        )}
        {summary.state.status === "ready" && !analyticsData && (
          <div className="rounded-lg border border-border bg-surface p-8 text-center">
            <p className="text-sm text-muted">No data available. Run your first content review to see analytics.</p>
            <Link
              href="/dashboard/content-review"
              className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              Start First Review
            </Link>
          </div>
        )}
      </section>

      {/* Charts Grid */}
      {analytics.state.status === "loading" && <LoadingLine label="Loading analytics…" />}
      {analytics.state.status === "error" && (
        <ErrorBanner error={analytics.state.error} onRetry={analytics.reload} title="Could not load analytics" />
      )}
      {analytics.state.status === "ready" && analyticsData && analyticsData.totalReviews > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Consistency Trend */}
          <Card variant="elevated">
            <CardHeader
              title="Consistency Trend"
              description="Daily brand consistency over time"
            />
            <CardContent>
              <ConsistencyTrendChart
                data={analyticsData.dailyTrend}
                onDateClick={(date) => {
                  console.log("Filter by date:", date);
                  // TODO: Navigate to filtered review history
                }}
              />
            </CardContent>
          </Card>

          {/* Outcome Distribution */}
          <Card variant="elevated">
            <CardHeader
              title="Review Outcomes"
              description="Distribution of validation results"
            />
            <CardContent>
              <OutcomeDistributionChart
                data={analyticsData.outcomeDistribution}
                onSegmentClick={(outcome) => {
                  console.log("Filter by outcome:", outcome);
                  // TODO: Navigate to filtered review history
                }}
              />
            </CardContent>
          </Card>

          {/* Rule Violations - Full Width */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader
              title="Most Violated Rules"
              description="Top rules triggering validation findings"
            />
            <CardContent>
              <RuleViolationsChart
                data={analyticsData.ruleViolations}
                onRuleClick={(ruleStableId) => {
                  console.log("Filter by rule:", ruleStableId);
                  // TODO: Navigate to filtered review history
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card variant="elevated">
        <CardHeader
          title="Recent Activity"
          description="Latest validation reviews"
          action={
            <Link
              href="/dashboard/review-history"
              className="text-sm font-medium text-accent hover:text-accent-hover underline-offset-2 hover:underline"
            >
              View all →
            </Link>
          }
        />
        <CardContent>
          {recent.state.status === "loading" && <LoadingLine label="Loading activity…" />}
          {recent.state.status === "error" && (
            <ErrorBanner error={recent.state.error} onRetry={recent.reload} title="Could not load recent activity" />
          )}
          {recent.state.status === "ready" && recent.state.data.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted">No reviews yet. Open Content Review to create the first record.</p>
              <Link
                href="/dashboard/content-review"
                className="mt-3 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Start First Review
              </Link>
            </div>
          )}
          {recent.state.status === "ready" && recent.state.data.length > 0 && (
            <ul className="divide-y divide-border">
              {recent.state.data.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/dashboard/review-history/${r.id}`}
                    className="-mx-3 flex flex-col gap-2 rounded-lg px-3 py-3 hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                        {r.brandName}
                        {r.brandIsDemo && <DemoPill />}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {new Date(r.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        · {r.summary.errors} error{r.summary.errors === 1 ? "" : "s"}, {r.summary.warnings} warning
                        {r.summary.warnings === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OutcomeBadge outcome={r.outcome} total={r.summary.total} />
                      {r.outcome === "findings_require_review" && (
                        <Link
                          href={`/dashboard/brand-repair?reviewId=${r.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border border-accent bg-accent/10 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/20"
                        >
                          Fix
                        </Link>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
