"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components";
import { ChevronDownIcon } from "@/components/Icons";
import { DemoPill, ErrorBanner, FindingCard, HighlightedText, LoadingLine, OutcomeBadge, ReviewDisclosure, ReviewLink } from "@/components/review/ReviewParts";
import { ApiError, apiPost, describeError, useApi } from "@/lib/client/api";
import { MAX_CONTENT_CHARS, getRuleTypeLabel } from "@/lib/review-engine";
import { sampleContent } from "@/lib/sample-content";
import type { BrandRule, BrandWithCounts, ReviewRun } from "@/backend";

const SAMPLES: { key: keyof typeof sampleContent; label: string }[] = [
  { key: "compliant", label: "Compliant example" },
  { key: "restrictedPhrases", label: "Restricted phrases" },
  { key: "absoluteClaim", label: "Absolute claim" },
];

export default function ContentReviewPage() {
  const brands = useApi<BrandWithCounts[]>("/api/brands");
  const [pickedBrandId, setPickedBrandId] = useState<string | null>(null);
  const brandList = brands.state.status === "ready" ? brands.state.data : [];
  const brandId = pickedBrandId ?? brandList[0]?.id ?? null;
  const brand = brandList.find((b) => b.id === brandId) ?? null;
  const rules = useApi<BrandRule[]>(brandId ? `/api/brands/${encodeURIComponent(brandId)}/rules` : null);

  const [content, setContent] = useState("");
  const [activeSample, setActiveSample] = useState<keyof typeof sampleContent | null>(null);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | string | null>(null);
  const [result, setResult] = useState<{ review: ReviewRun; text: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = content.trim();
  const tooLong = content.length > MAX_CONTENT_CHARS;
  const canAnalyze = !!brandId && trimmed.length > 0 && !tooLong && !submitting;

  const analyze = useCallback(async () => {
    if (!brandId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await apiPost<ReviewRun>("/api/reviews", { brandId, content: trimmed });
      setResult({ review: data, text: trimmed });
    } catch (e) {
      setResult(null);
      setSubmitError(e instanceof ApiError ? e : describeError(e));
    } finally {
      setSubmitting(false);
    }
  }, [brandId, trimmed]);

  const pickSample = (key: keyof typeof sampleContent) => {
    setContent(sampleContent[key]);
    setActiveSample(key);
    setResult(null);
    setSubmitError(null);
  };

  const fieldError = submitError instanceof ApiError ? (submitError.fields?.content ?? submitError.fields?.brandId) : undefined;
  const sortedFindings = useMemo(() => result?.review.findings ?? [], [result]);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Review</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Content review</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">Check copy against a brand&apos;s configured rules. Deterministic phrase matching, not AI. Every run is saved to review history.</p>
        </div>
        {brand?.isDemo && <DemoPill>Demo: {brand.name} is fictional</DemoPill>}
      </header>

      {brands.state.status === "error" && <ErrorBanner error={brands.state.error} onRetry={brands.reload} title="Could not load brands" />}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <Card variant="elevated">
            <CardHeader title="Content to review" description="Paste copy or load one of the demo samples." />
            <CardContent className="space-y-5">
              <div>
                <label htmlFor="brand-selector" className="mb-2 block text-sm font-medium text-foreground">Brand</label>
                <div className="relative sm:w-72">
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <select
                    id="brand-selector"
                    value={brandId ?? ""}
                    onChange={(e) => { setPickedBrandId(e.target.value); setResult(null); }}
                    disabled={brands.state.status !== "ready" || brandList.length === 0}
                    className="h-10 w-full appearance-none rounded-lg border border-input-border bg-input-bg pl-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  >
                    {brandList.map((b) => <option key={b.id} value={b.id}>{b.name}{b.isDemo ? " (fictional demo)" : ""}</option>)}
                  </select>
                </div>
                {brands.state.status === "loading" && <p className="mt-1 text-xs text-muted">Loading brands…</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="content-input" className="text-sm font-medium text-foreground">Content</label>
                  <span className={`text-xs ${tooLong ? "font-medium text-error" : "text-muted"}`} aria-live="polite">
                    {content.length.toLocaleString("en-US")} / {MAX_CONTENT_CHARS.toLocaleString("en-US")}
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  id="content-input"
                  value={content}
                  onChange={(e) => { setContent(e.target.value); setActiveSample(null); }}
                  rows={12}
                  placeholder="Paste marketing copy, a product description, or a social post…"
                  aria-invalid={tooLong || !!fieldError}
                  aria-describedby="content-help"
                  className="w-full resize-y rounded-lg border border-input-border bg-input-bg px-4 py-3 font-sans text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p id="content-help" className={`mt-1 text-xs ${tooLong || fieldError ? "text-error" : "text-muted"}`}>
                  {tooLong ? `Over the ${MAX_CONTENT_CHARS.toLocaleString("en-US")}-character limit. Shorten the text to analyze it.` : fieldError ?? `Up to ${MAX_CONTENT_CHARS.toLocaleString("en-US")} characters.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Demo samples">
                <span className="mr-1 text-xs uppercase tracking-wider text-muted">Samples</span>
                {SAMPLES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => pickSample(s.key)}
                    aria-pressed={activeSample === s.key}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${activeSample === s.key ? "border-transparent bg-accent text-accent-foreground" : "border-border bg-surface text-foreground hover:bg-surface-hover"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={analyze}
                  disabled={!canAnalyze}
                  aria-busy={submitting}
                  className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Analyzing and saving…" : "Analyze content"}
                </button>
                <p className="text-xs text-muted">Saves a review record (rule snapshot, findings, content fingerprint).</p>
              </div>

              {submitError && <ErrorBanner error={submitError} title="The review was not saved" onRetry={canAnalyze ? analyze : undefined} />}
            </CardContent>
          </Card>

          {result && (
            <section aria-labelledby="results-heading" className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="results-heading" className="font-heading text-2xl font-semibold text-foreground">Findings</h2>
                <div className="flex items-center gap-3">
                  <OutcomeBadge outcome={result.review.outcome} total={result.review.summary.total} />
                  {result.review.findings.length > 0 && (
                    <Link
                      href={`/dashboard/brand-repair?reviewId=${encodeURIComponent(result.review.id)}`}
                      className="rounded-lg border border-accent bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                    >
                      Fix Issues
                    </Link>
                  )}
                  <ReviewLink id={result.review.id} />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">Analyzed text · {result.review.brandName}</p>
                <HighlightedText text={result.text} findings={sortedFindings} />
              </div>
              {sortedFindings.length > 0 && (
                <ul className="space-y-3" aria-label="Findings">
                  {sortedFindings.map((f) => <FindingCard key={f.id} finding={f} />)}
                </ul>
              )}
              <p className="text-xs text-muted">
                {result.review.summary.errors} error{result.review.summary.errors === 1 ? "" : "s"} · {result.review.summary.warnings} warning{result.review.summary.warnings === 1 ? "" : "s"} ·
                {" "}{result.review.ruleSnapshot.filter((r) => r.enabled).length} enabled rule{result.review.ruleSnapshot.filter((r) => r.enabled).length === 1 ? "" : "s"} evaluated
              </p>
              <ReviewDisclosure outcome={result.review.outcome} />
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-labelledby="rules-heading">
          <div className="flex items-center justify-between">
            <h2 id="rules-heading" className="font-heading text-lg font-semibold text-foreground">Active rules</h2>
            <button type="button" onClick={() => setRulesOpen((o) => !o)} aria-expanded={rulesOpen} aria-controls="rules-panel" className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground">
              <span className="sr-only">{rulesOpen ? "Collapse" : "Expand"} rules</span>
              <ChevronDownIcon className={`transition-transform ${rulesOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          {rulesOpen && (
            <div id="rules-panel" className="divide-y divide-border rounded-lg border border-border bg-surface">
              {rules.state.status === "loading" && brandId && <div className="px-4"><LoadingLine label="Loading rules…" /></div>}
              {rules.state.status === "error" && <div className="p-4"><ErrorBanner error={rules.state.error} onRetry={rules.reload} title="Could not load rules" /></div>}
              {rules.state.status === "ready" && rules.state.data.length === 0 && <p className="p-4 text-sm text-muted">This brand has no rules yet. Add rules in Brand Guidelines.</p>}
              {rules.state.status === "ready" && rules.state.data.map((r) => (
                <div key={r.id} className={`space-y-1.5 p-4 ${r.enabled ? "" : "opacity-60"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{r.name}</span>
                    {!r.enabled && <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs text-muted">Disabled</span>}
                  </div>
                  <p className="text-xs text-muted">{getRuleTypeLabel(r.type)} · {r.severity === "error" ? "Error" : "Warning"} · v{r.version}</p>
                  <p className="text-xs text-muted">{r.patterns.length} pattern{r.patterns.length === 1 ? "" : "s"}</p>
                </div>
              ))}
            </div>
          )}
          {brand?.isDemo && <p className="text-xs text-muted">Morrow Goods is a fictional brand. Its rules are illustrative demo rules, not verified legal or commercial guidance.</p>}
        </aside>
      </div>
    </div>
  );
}
