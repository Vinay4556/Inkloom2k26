"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, RefreshIcon, ZapIcon } from "@/components/Icons";
import { useApi, apiPost } from "@/lib/client/api";
import type { ReviewRun, BrandRule, ReviewListItem } from "@/backend";

interface Correction {
  findingId: string;
  original: string;
  suggested: string;
  start: number;
  end: number;
  accepted: boolean | null; // null = pending, true = accepted, false = rejected
  ruleStableId: string;
}

function BrandRepairContent() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("reviewId");
  
  const review = useApi<ReviewRun>(reviewId ? `/api/reviews/${encodeURIComponent(reviewId)}` : null);
  const reviewList = useApi<ReviewListItem[]>(reviewId ? null : "/api/reviews?limit=20");
  const rules = useApi<BrandRule[]>(
    review.state.status === "ready" && review.state.data.brandId
      ? `/api/brands/${encodeURIComponent(review.state.data.brandId)}/rules`
      : null
  );
  
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [revalidating, setRevalidating] = useState(false);
  const [revalidationResult, setRevalidationResult] = useState<ReviewRun | null>(null);

  // Initialize corrections from findings
  useMemo(() => {
    if (review.state.status === "ready" && corrections.length === 0) {
      const newCorrections: Correction[] = review.state.data.findings.map((finding) => ({
        findingId: finding.id,
        original: finding.matchedPhrase,
        suggested: generateSuggestion(finding.matchedPhrase, finding.ruleType, finding.suggestion),
        start: finding.start,
        end: finding.end,
        accepted: null,
        ruleStableId: finding.ruleStableId,
      }));
      setCorrections(newCorrections);
    }
  }, [review.state, corrections.length]);

  // Empty state: No review selected
  if (!reviewId) {
    return (
      <div className="space-y-8 animate-fade-in">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Repair</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Brand Repair</h1>
          <p className="mt-1 text-sm text-muted">Accept or reject suggested corrections and revalidate content</p>
        </header>

        <Card variant="elevated">
          <CardContent className="py-16 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <ZapIcon className="h-8 w-8 text-accent" ariaHidden />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">No review selected</h2>
              <p className="text-sm text-muted">
                Select a review with findings to see suggested corrections.
              </p>
              
              {reviewList.state.status === "loading" && (
                <p className="text-sm text-muted">Loading recent reviews...</p>
              )}
              
              {reviewList.state.status === "ready" && reviewList.state.data.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">No reviews found. Run a content review first.</p>
                  <Link
                    href="/dashboard/content-review"
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
                  >
                    Start Content Review
                  </Link>
                </div>
              )}
              
              {reviewList.state.status === "ready" && reviewList.state.data.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Recent reviews with findings:</p>
                  <ul className="space-y-2 text-left">
                    {reviewList.state.data
                      .filter((r) => r.outcome === "findings_require_review")
                      .slice(0, 5)
                      .map((r) => (
                        <li key={r.id}>
                          <Link
                            href={`/dashboard/brand-repair?reviewId=${encodeURIComponent(r.id)}`}
                            className="block rounded-lg border border-border bg-surface px-4 py-3 text-left hover:bg-surface-hover transition-colors"
                          >
                            <p className="text-sm font-medium text-foreground">{r.brandName}</p>
                            <p className="text-xs text-muted">
                              {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {r.summary.total} finding{r.summary.total === 1 ? "" : "s"}
                            </p>
                          </Link>
                        </li>
                      ))}
                  </ul>
                  {reviewList.state.data.filter((r) => r.outcome === "findings_require_review").length === 0 && (
                    <p className="text-sm text-muted">All recent reviews passed validation. Run a new review with violations to use Brand Repair.</p>
                  )}
                  <Link
                    href="/dashboard/review-history"
                    className="inline-block text-sm font-medium text-accent hover:text-accent-hover underline-offset-2 hover:underline"
                  >
                    View all reviews →
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (review.state.status === "loading") {
    return (
      <div className="space-y-8 animate-fade-in">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Repair</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Brand Repair</h1>
          <p className="mt-1 text-sm text-muted">Accept or reject suggested corrections and revalidate content</p>
        </header>
        <div className="animate-pulse">Loading review...</div>
      </div>
    );
  }

  if (review.state.status === "error") {
    return (
      <div className="space-y-8 animate-fade-in">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Repair</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Brand Repair</h1>
          <p className="mt-1 text-sm text-muted">Accept or reject suggested corrections and revalidate content</p>
        </header>
        <Card variant="elevated">
          <CardContent className="py-8">
            <p className="text-error">Error loading review. The review may have been deleted or does not exist.</p>
            <Link
              href="/dashboard/review-history"
              className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover underline-offset-2 hover:underline"
            >
              Back to Review History
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: reviewData } = review.state;
  
  // Handle case where review has no findings
  if (reviewData.findings.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Repair</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Brand Repair</h1>
          <p className="mt-1 text-sm text-muted">Accept or reject suggested corrections and revalidate content</p>
        </header>
        
        <Card variant="elevated">
          <CardContent className="py-16 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircleIcon className="h-8 w-8 text-success" ariaHidden />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">No violations to repair</h2>
              <p className="text-sm text-muted">
                This review passed all validation rules. There are no suggested corrections.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/dashboard/content-review"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors"
                >
                  New Review
                </Link>
                <Link
                  href={`/dashboard/review-history/${reviewData.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const originalContent = reviewData.content || "[Content not retained]";
  const ruleMap = new Map(
    rules.state.status === "ready"
      ? rules.state.data.map((r) => [r.stableId, r])
      : []
  );

  const handleAccept = (findingId: string) => {
    setCorrections((prev) =>
      prev.map((c) => (c.findingId === findingId ? { ...c, accepted: true } : c))
    );
  };

  const handleReject = (findingId: string) => {
    setCorrections((prev) =>
      prev.map((c) => (c.findingId === findingId ? { ...c, accepted: false } : c))
    );
  };

  const handleRevalidate = async () => {
    setRevalidating(true);
    setRevalidationResult(null);
    
    try {
      // Apply accepted corrections
      let repairedContent = originalContent;
      const acceptedCorrections = corrections
        .filter((c) => c.accepted === true)
        .sort((a, b) => b.start - a.start); // Apply from end to start to preserve indices

      for (const correction of acceptedCorrections) {
        repairedContent =
          repairedContent.substring(0, correction.start) +
          correction.suggested +
          repairedContent.substring(correction.end);
      }

      // Submit for revalidation
      const { data } = await apiPost<ReviewRun>("/api/reviews", {
        brandId: reviewData.brandId,
        content: repairedContent,
      });
      
      setRevalidationResult(data);
    } catch (error) {
      console.error("Revalidation failed:", error);
    } finally {
      setRevalidating(false);
    }
  };

  const acceptedCount = corrections.filter((c) => c.accepted === true).length;
  const rejectedCount = corrections.filter((c) => c.accepted === false).length;
  const pendingCount = corrections.filter((c) => c.accepted === null).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center gap-4">
        <Link
          href={`/dashboard/review-history/${reviewId}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-hover transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" ariaHidden />
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Brand Repair</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">One-Click Brand Repair</h1>
          <p className="mt-1 text-sm text-muted">Review and apply suggested corrections</p>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{acceptedCount}</p>
                <p className="text-sm text-muted">Accepted</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-success" ariaHidden />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
                <p className="text-sm text-muted">Rejected</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-error" ariaHidden />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted">Pending</p>
              </div>
              <RefreshIcon className="h-8 w-8 text-muted" ariaHidden />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Corrections List */}
      <Card variant="elevated">
        <CardHeader title="Suggested Corrections" description="Review each correction individually" />
        <CardContent>
          <div className="space-y-4">
            {corrections.map((correction) => {
              const rule = ruleMap.get(correction.ruleStableId);
              return (
                <div
                  key={correction.findingId}
                  className={`rounded-lg border p-4 transition-colors ${
                    correction.accepted === true
                      ? "border-success bg-success-bg"
                      : correction.accepted === false
                      ? "border-error bg-error-bg"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{rule?.name || "Unknown Rule"}</p>
                      <p className="text-sm text-muted">{rule?.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(correction.findingId)}
                        disabled={correction.accepted === false}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-hover disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAccept(correction.findingId)}
                        disabled={correction.accepted === true}
                        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50 transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">Original</p>
                      <p className="rounded bg-background px-3 py-2 font-mono text-sm text-foreground">
                        {correction.original}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">Suggested</p>
                      <p className="rounded bg-background px-3 py-2 font-mono text-sm text-accent">
                        {correction.suggested}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Revalidate Button */}
      {acceptedCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleRevalidate}
            disabled={revalidating}
            className="rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {revalidating ? "Revalidating..." : `Revalidate with ${acceptedCount} correction${acceptedCount === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {/* Revalidation Result */}
      {revalidationResult && (
        <Card variant="elevated">
          <CardHeader title="Revalidation Result" description="Content checked again after applying corrections" />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  {revalidationResult.outcome === "no_rules_triggered" ? (
                    <CheckCircleIcon className="h-6 w-6 text-success" ariaHidden />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-warning" ariaHidden />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {revalidationResult.outcome === "no_rules_triggered"
                      ? "No issues found!"
                      : `${revalidationResult.summary.total} finding${revalidationResult.summary.total === 1 ? "" : "s"} remaining`}
                  </p>
                  <p className="text-sm text-muted">
                    {revalidationResult.outcome === "no_rules_triggered"
                      ? "Content now complies with all active rules"
                      : "Additional corrections may be needed"}
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/review-history/${revalidationResult.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                View detailed results →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to generate simple suggestions
function generateSuggestion(original: string, ruleType: string, ruleSuggestion: string): string {
  // For now, use the rule's suggestion or a generic replacement
  if (ruleSuggestion && ruleSuggestion.trim()) {
    return ruleSuggestion;
  }
  
  // Simple deterministic suggestions based on rule type
  switch (ruleType) {
    case "restricted-phrase":
      return "[review needed]";
    case "absolute-claim":
      return original.replace(/100%|zero|completely|totally|fully/gi, "");
    case "vague-superlative":
      return "[specific claim needed]";
    case "prohibited-term":
      return "[alternative term]";
    case "capitalization":
      return original.charAt(0).toUpperCase() + original.slice(1).toLowerCase();
    default:
      return "[correction needed]";
  }
}

export default function BrandRepairPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading repair tool...</div>}>
      <BrandRepairContent />
    </Suspense>
  );
}
