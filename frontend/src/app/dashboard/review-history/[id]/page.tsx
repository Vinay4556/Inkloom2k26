"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components";
import { DemoPill, ErrorBanner, FindingCard, HighlightedText, LoadingLine, OutcomeBadge, ReviewDisclosure } from "@/components/review/ReviewParts";
import { ApiError, apiDelete, describeError, useApi } from "@/lib/client/api";
import { getRuleTypeLabel } from "@/lib/review-engine";
import type { ReviewRun } from "@inkloom/backend";

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const review = useApi<ReviewRun>(`/api/reviews/${encodeURIComponent(id)}`);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const remove = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDelete(`/api/reviews/${encodeURIComponent(id)}`);
      router.push("/dashboard/review-history");
    } catch (e) {
      setDeleteError(describeError(e));
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/dashboard/review-history" className="text-muted underline-offset-2 hover:text-foreground hover:underline">← Review history</Link>
      </nav>

      {review.state.status === "loading" && <LoadingLine label="Loading review…" />}
      {review.state.status === "error" && (
        review.state.error instanceof ApiError && review.state.error.status === 404
          ? <ErrorBanner error="This review does not exist or has been deleted." title="Review not found" />
          : <ErrorBanner error={review.state.error} onRetry={review.reload} title="Could not load this review" />
      )}

      {review.state.status === "ready" && (() => {
        const r = review.state.data;
        return (
          <>
            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-3xl font-semibold text-foreground">{r.brandName}</h1>
                {r.brandIsDemo && <DemoPill />}
                <OutcomeBadge outcome={r.outcome} total={r.summary.total} />
                {r.findings.length > 0 && (
                  <Link
                    href={`/dashboard/brand-repair?reviewId=${encodeURIComponent(r.id)}`}
                    className="rounded-lg border border-accent bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                  >
                    Fix Issues
                  </Link>
                )}
              </div>
              <p className="text-sm text-muted">
                {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })} · {r.contentLength.toLocaleString("en-US")} characters · run by demo reviewer (no real authentication)
              </p>
            </header>

            {r.content !== null ? (
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">Submitted text</p>
                <HighlightedText text={r.content} findings={r.findings} />
              </div>
            ) : (
              <p className="rounded-lg border border-border bg-surface-hover p-4 text-sm text-muted">
                The submitted text was not retained (default privacy setting). Only a fingerprint, the findings, and the rule snapshot were saved.
                <span className="mt-1 block break-all font-mono text-xs">SHA-256 {r.contentFingerprint}</span>
              </p>
            )}

            <section aria-labelledby="f-heading" className="space-y-3">
              <h2 id="f-heading" className="font-heading text-2xl font-semibold text-foreground">Findings</h2>
              {r.findings.length === 0
                ? <p className="text-sm text-muted">No configured rules triggered.</p>
                : <ul className="space-y-3">{r.findings.map((f) => <FindingCard key={f.id} finding={f} />)}</ul>}
            </section>

            <Card variant="elevated">
              <CardHeader title="Rules applied" description="A snapshot of the brand's rules at the time of this review. Later edits do not change it." />
              <CardContent>
                <ul className="divide-y divide-border text-sm">
                  {r.ruleSnapshot.map((s) => (
                    <li key={s.stableId} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <span className="font-medium text-foreground">{s.name} <span className="font-mono text-xs font-normal text-muted">v{s.version}</span></span>
                      <span className="text-xs text-muted">{getRuleTypeLabel(s.type)} · {s.severity} · {s.enabled ? `${s.patterns.length} patterns` : "disabled"}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <ReviewDisclosure outcome={r.outcome} />

            <div className="border-t border-border pt-6">
              {deleteError && <div className="mb-3"><ErrorBanner error={deleteError} title="Could not delete" /></div>}
              {!confirming ? (
                <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-error underline-offset-2 hover:underline">Delete this review record</button>
              ) : (
                <div className="flex flex-wrap items-center gap-3" role="alertdialog" aria-label="Confirm deletion">
                  <span className="text-sm text-foreground">Permanently delete this review and its findings?</span>
                  <button type="button" onClick={remove} disabled={deleting} className="rounded-lg bg-error px-3 py-1.5 text-sm font-medium text-background disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button>
                  <button type="button" onClick={() => setConfirming(false)} className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover">Cancel</button>
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}


// Next.js 16 prerender configuration - allow dynamic params
export const dynamic = "force-dynamic";
