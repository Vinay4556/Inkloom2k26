"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, EmptyState } from "@/components";
import { DemoPill, ErrorBanner, LoadingLine, OutcomeBadge } from "@/components/review/ReviewParts";
import { apiGet, describeError, useApi } from "@/lib/client/api";
import type { ReviewListItem } from "@/backend";

const PAGE_SIZE = 20;
const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function ReviewHistoryPage() {
  const first = useApi<ReviewListItem[]>(`/api/reviews?limit=${PAGE_SIZE}`);
  const [more, setMore] = useState<ReviewListItem[]>([]);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  const nextCursor = cursor !== undefined ? cursor : first.state.status === "ready" ? first.state.nextCursor : null;

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const r = await apiGet<ReviewListItem[]>(`/api/reviews?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(nextCursor)}`);
      setMore((m) => [...m, ...r.data]);
      setCursor(r.nextCursor ?? null);
    } catch (e) {
      setMoreError(describeError(e));
    } finally {
      setLoadingMore(false);
    }
  };

  const items = first.state.status === "ready" ? [...first.state.data, ...more] : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Record</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Review history</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">Every analysis run, newest first, read from saved records.</p>
      </header>

      <Card variant="elevated">
        <CardHeader title="All reviews" description="Select a review to see its findings and the rules that were applied." />
        <CardContent>
          {first.state.status === "loading" && <LoadingLine label="Loading review history…" />}
          {first.state.status === "error" && <ErrorBanner error={first.state.error} onRetry={first.reload} title="Could not load review history" />}
          {first.state.status === "ready" && items.length === 0 && (
            <EmptyState
              title="No reviews yet"
              description="Reviews appear here after you analyze content. Nothing is shown until a real review has been saved."
              icon="history"
              action={{ label: "Start a review", href: "/dashboard/content-review" }}
            />
          )}
          {items.length > 0 && (
            <ul className="divide-y divide-border">
              {items.map((r) => (
                <li key={r.id}>
                  <Link href={`/dashboard/review-history/${r.id}`} className="-mx-3 flex flex-col gap-2 rounded-lg px-3 py-4 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                        {r.brandName}{r.brandIsDemo && <DemoPill />}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {fmt(r.createdAt)} · {r.contentLength.toLocaleString("en-US")} characters · {r.summary.errors} error{r.summary.errors === 1 ? "" : "s"}, {r.summary.warnings} warning{r.summary.warnings === 1 ? "" : "s"}
                      </p>
                    </div>
                    <OutcomeBadge outcome={r.outcome} total={r.summary.total} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {moreError && <div className="mt-4"><ErrorBanner error={moreError} onRetry={loadMore} title="Could not load more" /></div>}
          {nextCursor && (
            <div className="mt-4">
              <button type="button" onClick={loadMore} disabled={loadingMore} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover disabled:opacity-50">
                {loadingMore ? "Loading…" : "Load older reviews"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
