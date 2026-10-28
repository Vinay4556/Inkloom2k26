import type { DemoBrand } from "../data/demo-brands.ts";

/**
 * Deterministic review engine.
 *
 * - Pure functions, no I/O, no AI. Safe to run on server or client.
 * - Case-insensitive literal matching using Unicode case folding (RegExp "iu"),
 *   so reported offsets always index into the ORIGINAL text.
 * - Matching is substring-based (not word-boundary based), as in the original engine.
 * - Overlapping matches from the SAME rule are collapsed to the longest match.
 *   Matches from different rules are never merged, so each rule is reported.
 * - Zero findings means "no configured rule triggered". It is NOT proof of compliance.
 */

export type Severity = "warning" | "error";
export type RuleType = 
  | "absolute-claim" 
  | "restricted-phrase" 
  | "vague-superlative"
  | "preferred-term"
  | "prohibited-term"
  | "capitalization"
  | "required-phrase"
  | "tone-guidance";

export const RULE_TYPES: readonly RuleType[] = [
  "absolute-claim",
  "restricted-phrase", 
  "vague-superlative",
  "preferred-term",
  "prohibited-term",
  "capitalization",
  "required-phrase",
  "tone-guidance"
];
export const SEVERITIES: readonly Severity[] = ["warning", "error"];
export const MAX_CONTENT_CHARS = 10000;

export interface EngineRule {
  /** Stable identifier of the rule (survives edits). */
  id: string;
  type: RuleType;
  severity: Severity;
  patterns: string[];
  explanation: string;
  suggestion: string;
  /** Defaults to true when omitted. */
  enabled?: boolean;
  /** Rule version recorded on each finding. Defaults to 1. */
  version?: number;
}

export interface Finding {
  /** Stable within a single analysis: `${ruleId}:${start}:${end}`. */
  id: string;
  ruleId: string;
  ruleVersion: number;
  ruleType: RuleType;
  severity: Severity;
  matchedPhrase: string;
  explanation: string;
  suggestion: string;
  /** Start offset (UTF-16 code units) in the analyzed text. */
  index: number;
  /** End offset, exclusive. */
  end: number;
}

export type ReviewOutcome = "no_rules_triggered" | "findings_require_review";

export interface AnalysisResult {
  findings: Finding[];
  summary: { total: number; errors: number; warnings: number };
  outcome: ReviewOutcome;
  rulesEvaluated: number;
}

export interface ReviewResult {
  findings: Finding[];
  hasFindings: boolean;
  analyzedText: string;
  brandId: string;
  brandName: string;
  timestamp: string;
}

interface RawMatch {
  phrase: string;
  start: number;
  end: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findMatches(text: string, patterns: readonly string[]): RawMatch[] {
  const matches: RawMatch[] = [];
  for (const raw of patterns) {
    const pattern = raw.trim();
    if (!pattern) continue;
    const re = new RegExp(escapeRegExp(pattern), "giu");
    for (const m of text.matchAll(re)) {
      if (m[0].length === 0 || m.index === undefined) continue;
      matches.push({ phrase: m[0], start: m.index, end: m.index + m[0].length });
    }
  }
  // Collapse overlaps within one rule: earliest start wins, then longest.
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const kept: RawMatch[] = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      kept.push(m);
      lastEnd = m.end;
    }
  }
  return kept;
}

export function analyze(text: string, rules: readonly EngineRule[]): AnalysisResult {
  const findings: Finding[] = [];
  let rulesEvaluated = 0;

  for (const rule of rules) {
    if (rule.enabled === false) continue;
    rulesEvaluated += 1;
    for (const match of findMatches(text, rule.patterns)) {
      findings.push({
        id: `${rule.id}:${match.start}:${match.end}`,
        ruleId: rule.id,
        ruleVersion: rule.version ?? 1,
        ruleType: rule.type,
        severity: rule.severity,
        matchedPhrase: match.phrase,
        explanation: rule.explanation,
        suggestion: rule.suggestion,
        index: match.start,
        end: match.end,
      });
    }
  }

  findings.sort((a, b) => a.index - b.index || a.ruleId.localeCompare(b.ruleId));
  const errors = findings.filter((f) => f.severity === "error").length;
  return {
    findings,
    summary: { total: findings.length, errors, warnings: findings.length - errors },
    outcome: findings.length > 0 ? "findings_require_review" : "no_rules_triggered",
    rulesEvaluated,
  };
}

/** Backwards-compatible wrapper used by the original UI. */
export function analyzeContent(text: string, brand: DemoBrand): ReviewResult {
  const result = analyze(text, brand.rules);
  return {
    findings: result.findings,
    hasFindings: result.findings.length > 0,
    analyzedText: text,
    brandId: brand.id,
    brandName: brand.name,
    timestamp: new Date().toISOString(),
  };
}

export function getSeverityLabel(severity: Severity): string {
  return severity === "error" ? "Error" : "Warning";
}

export function getRuleTypeLabel(type: RuleType): string {
  switch (type) {
    case "absolute-claim":
      return "Absolute claim";
    case "restricted-phrase":
      return "Restricted phrase";
    case "vague-superlative":
      return "Vague superlative";
    case "preferred-term":
      return "Preferred terminology";
    case "prohibited-term":
      return "Prohibited terminology";
    case "capitalization":
      return "Capitalization";
    case "required-phrase":
      return "Required phrase";
    case "tone-guidance":
      return "Tone guidance";
    default:
      return type;
  }
}
