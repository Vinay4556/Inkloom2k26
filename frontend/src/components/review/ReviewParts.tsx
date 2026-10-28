import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircleIcon, CheckCircleIcon } from "@/components/Icons";
import { getRuleTypeLabel } from "@/lib/review-engine";
import type { ReviewOutcome } from "@/lib/review-engine";
import type { ReviewFindingRecord } from "@/backend";
import type { ApiError } from "@/lib/client/api";

export function SeverityBadge({ severity }: { severity: "warning" | "error" }) {
  const isError = severity === "error";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${isError ? "bg-error-bg text-error border-error-border" : "bg-warning-bg text-warning border-warning-border"}`}>
      {isError ? "Error · blocking" : "Warning · advisory"}
    </span>
  );
}

export function OutcomeBadge({ outcome, total }: { outcome: ReviewOutcome; total: number }) {
  const hit = outcome === "findings_require_review";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${hit ? "bg-warning-bg text-warning border-warning-border" : "bg-accent-muted text-accent border-info-border"}`}>
      {hit ? `${total} finding${total === 1 ? "" : "s"} · review required` : "No configured rules triggered"}
    </span>
  );
}

export function FindingCard({ finding }: { finding: ReviewFindingRecord }) {
  const isError = finding.severity === "error";
  return (
    <li className={`rounded-lg border bg-surface p-4 border-l-4 ${isError ? "border-error-border border-l-error" : "border-warning-border border-l-warning"}`}>
      <div className="flex items-start gap-3">
        <AlertCircleIcon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isError ? "text-error" : "text-warning"}`} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-muted">{getRuleTypeLabel(finding.ruleType)}</span>
            <span className="font-mono text-xs text-muted">rule {finding.ruleStableId} v{finding.ruleVersion}</span>
          </div>
          <p className="text-sm text-foreground">
            Matched <code className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs">{finding.matchedPhrase}</code>
            <span className="ml-2 text-xs text-muted">characters {finding.start}–{finding.end}</span>
          </p>
          <p className="text-sm text-muted">{finding.explanation}</p>
          {finding.suggestion && (
            <p className="text-sm text-muted"><span className="font-medium text-foreground">Suggested correction: </span>{finding.suggestion}</p>
          )}
        </div>
      </div>
    </li>
  );
}

/** Renders text with matched ranges marked. Built from React nodes, never raw HTML. */
export function HighlightedText({ text, findings }: { text: string; findings: Pick<ReviewFindingRecord, "start" | "end" | "severity">[] }) {
  const ranges = findings
    .filter((f) => f.start >= 0 && f.end <= text.length && f.end > f.start)
    .map((f) => ({ start: f.start, end: f.end, error: f.severity === "error" }))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: { start: number; end: number; error: boolean }[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start < last.end) { last.end = Math.max(last.end, r.end); last.error = last.error || r.error; }
    else merged.push({ ...r });
  }
  const nodes: ReactNode[] = [];
  let pos = 0;
  merged.forEach((m, i) => {
    if (m.start > pos) nodes.push(text.slice(pos, m.start));
    nodes.push(
      <mark key={i} className={`rounded px-0.5 text-foreground ${m.error ? "bg-error-bg underline decoration-error decoration-2 underline-offset-2" : "bg-warning-bg underline decoration-warning decoration-dotted decoration-2 underline-offset-2"}`}>
        {text.slice(m.start, m.end)}
      </mark>,
    );
    pos = m.end;
  });
  if (pos < text.length) nodes.push(text.slice(pos));
  return <p className="max-h-72 overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{nodes}</p>;
}

export function ReviewDisclosure({ outcome }: { outcome: ReviewOutcome }) {
  return (
    <div className="rounded-lg border border-border bg-surface-hover p-4" role="note">
      <div className="flex items-start gap-3">
        {outcome === "no_rules_triggered"
          ? <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
          : <AlertCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />}
        <div className="space-y-1 text-sm text-muted">
          <p className="font-medium text-foreground">Human review is still required</p>
          <p>
            This check matches literal phrases from the brand&apos;s configured rules. It cannot assess factual accuracy, legal compliance, tone, or claims
            no rule covers. {outcome === "no_rules_triggered" ? "No configured rule triggered, which is not evidence that this content is compliant." : "Findings are guidance, not a legal determination."}
          </p>
          <p>Recording approve / reject decisions inside Inkloom is not implemented yet; this review is saved as an analysis record only.</p>
        </div>
      </div>
    </div>
  );
}

export function ErrorBanner({ error, onRetry, title = "Something went wrong" }: { error: ApiError | string; onRetry?: () => void; title?: string }) {
  const message = typeof error === "string" ? error : error.message;
  return (
    <div className="rounded-lg border border-error-border bg-error-bg p-4" role="alert">
      <p className="text-sm font-medium text-error">{title}</p>
      <p className="mt-1 text-sm text-foreground">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-hover">
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadingLine({ label }: { label: string }) {
  return <p className="py-6 text-sm text-muted" role="status" aria-live="polite">{label}</p>;
}

export function DemoPill({ children = "Fictional demo brand" }: { children?: ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent">{children}</span>;
}

export function ReviewLink({ id }: { id: string }) {
  return <Link href={`/dashboard/review-history/${id}`} className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover">Open saved review</Link>;
}
