"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components";
import { DemoPill, ErrorBanner, LoadingLine, OutcomeBadge } from "@/components/review/ReviewParts";
import { useApi } from "@/lib/client/api";
import type { ReviewListItem, Summary } from "@/backend";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-l-2 border-border pl-4">
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 font-heading text-3xl font-semibold text-foreground">{value}</dd>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const summary = useApi<Summary>("/api/summary");
  const recent = useApi<ReviewListItem[]>("/api/reviews?limit=5");

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Overview</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Workspace</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">Figures below are counted from saved records. Local demo environment: no sign-in, one shared demo workspace.</p>
      </header>

      <section aria-label="Summary">
        {summary.state.status === "loading" && <LoadingLine label="Loading summary…" />}
        {summary.state.status === "error" && <ErrorBanner error={summary.state.error} onRetry={summary.reload} title="Could not load the summary" />}
        {summary.state.status === "ready" && (
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <Stat label="Brands" value={String(summary.state.data.brands)} />
            <Stat label="Enabled rules" value={String(summary.state.data.enabledRules)} />
            <Stat label="Reviews run" value={String(summary.state.data.reviews)} />
            <Stat label="With findings" value={String(summary.state.data.reviewsWithFindings)} hint={summary.state.data.reviews === 0 ? "No reviews yet" : undefined} />
          </dl>
        )}
      </section>

      <Card variant="elevated">
        <CardHeader
          title="Recent reviews"
          action={<Link href="/dashboard/content-review" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover">New review</Link>}
        />
        <CardContent>
          {recent.state.status === "loading" && <LoadingLine label="Loading recent reviews…" />}
          {recent.state.status === "error" && <ErrorBanner error={recent.state.error} onRetry={recent.reload} title="Could not load recent reviews" />}
          {recent.state.status === "ready" && recent.state.data.length === 0 && (
            <p className="py-6 text-sm text-muted">No reviews have been run yet. Open Content review, load a sample, and analyze it to create the first record.</p>
          )}
          {recent.state.status === "ready" && recent.state.data.length > 0 && (
            <ul className="divide-y divide-border">
              {recent.state.data.map((r) => (
                <li key={r.id}>
                  <Link href={`/dashboard/review-history/${r.id}`} className="-mx-3 flex flex-col gap-2 rounded-lg px-3 py-3 hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                      {r.brandName}{r.brandIsDemo && <DemoPill />}
                      <span className="text-xs font-normal text-muted">{new Date(r.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                    </span>
                    <OutcomeBadge outcome={r.outcome} total={r.summary.total} />
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
