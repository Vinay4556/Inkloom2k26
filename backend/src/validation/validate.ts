import { RULE_TYPES, SEVERITIES, MAX_CONTENT_CHARS } from "../services/review-engine.ts";
import type { RuleType, Severity } from "../services/review-engine.ts";

export type Fields = Record<string, string>;
export type Validated<T> = { ok: true; value: T } | { ok: false; fields: Fields };

export const LIMITS = { name: 80, description: 500, tone: 200, suggestion: 500, pattern: 100, patterns: 50, stableId: 63 } as const;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function str(v: unknown, field: string, max: number, fields: Fields, opts: { required: boolean }): string | undefined {
  if (v === undefined || v === null) {
    if (opts.required) fields[field] = "Required.";
    return undefined;
  }
  if (typeof v !== "string") { fields[field] = "Must be a string."; return undefined; }
  const t = v.trim();
  if (opts.required && t.length === 0) { fields[field] = "Required."; return undefined; }
  if (t.length > max) { fields[field] = `Must be at most ${max} characters.`; return undefined; }
  return t;
}

export function slugify(input: string): string {
  return input.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, LIMITS.stableId);
}

export function validateBrandInput(body: unknown, partial: boolean): Validated<{ name?: string; description?: string; tone?: string }> {
  const fields: Fields = {};
  if (!isObject(body)) return { ok: false, fields: { body: "Expected a JSON object." } };
  const name = str(body.name, "name", LIMITS.name, fields, { required: !partial });
  const description = str(body.description, "description", LIMITS.description, fields, { required: false });
  const tone = str(body.tone, "tone", LIMITS.tone, fields, { required: false });
  if (partial && name === undefined && description === undefined && tone === undefined && Object.keys(fields).length === 0) {
    return { ok: false, fields: { body: "Provide at least one field to update." } };
  }
  if (Object.keys(fields).length) return { ok: false, fields };
  return { ok: true, value: { name, description, tone } };
}

function patterns(v: unknown, fields: Fields): string[] | undefined {
  if (v === undefined) return undefined;
  if (!Array.isArray(v)) { fields.patterns = "Must be an array of strings."; return undefined; }
  if (v.length === 0) { fields.patterns = "Provide at least one pattern."; return undefined; }
  if (v.length > LIMITS.patterns) { fields.patterns = `At most ${LIMITS.patterns} patterns.`; return undefined; }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of v) {
    if (typeof p !== "string" || p.trim().length === 0) { fields.patterns = "Patterns must be non-empty strings."; return undefined; }
    const t = p.trim();
    if (t.length > LIMITS.pattern) { fields.patterns = `Each pattern must be at most ${LIMITS.pattern} characters.`; return undefined; }
    const k = t.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(t); }
  }
  return out;
}

export interface RuleInput {
  stableId?: string; name?: string; type?: RuleType; description?: string; severity?: Severity;
  patterns?: string[]; suggestion?: string; enabled?: boolean;
}

export function validateRuleInput(body: unknown, partial: boolean): Validated<RuleInput> {
  const fields: Fields = {};
  if (!isObject(body)) return { ok: false, fields: { body: "Expected a JSON object." } };
  const name = str(body.name, "name", LIMITS.name, fields, { required: !partial });
  const description = str(body.description, "description", LIMITS.description, fields, { required: !partial });
  const suggestion = str(body.suggestion, "suggestion", LIMITS.suggestion, fields, { required: false });
  let type: RuleType | undefined;
  if (body.type !== undefined || !partial) {
    if (typeof body.type === "string" && (RULE_TYPES as readonly string[]).includes(body.type)) type = body.type as RuleType;
    else fields.type = `Must be one of: ${RULE_TYPES.join(", ")}.`;
  }
  let severity: Severity | undefined;
  if (body.severity !== undefined || !partial) {
    if (typeof body.severity === "string" && (SEVERITIES as readonly string[]).includes(body.severity)) severity = body.severity as Severity;
    else fields.severity = `Must be one of: ${SEVERITIES.join(", ")}.`;
  }
  const pats = patterns(body.patterns, fields);
  if (!partial && body.patterns === undefined) fields.patterns = "Required.";
  let enabled: boolean | undefined;
  if (body.enabled !== undefined) {
    if (typeof body.enabled === "boolean") enabled = body.enabled;
    else fields.enabled = "Must be true or false.";
  }
  let stableId: string | undefined;
  if (!partial) {
    const raw = str(body.stableId, "stableId", LIMITS.stableId, fields, { required: false });
    stableId = raw ?? (name ? slugify(name) : undefined);
    if (stableId !== undefined && !/^[a-z0-9][a-z0-9-]*$/.test(stableId)) fields.stableId = "Use lowercase letters, digits and hyphens.";
  } else if (body.stableId !== undefined) {
    fields.stableId = "stableId cannot be changed.";
  }
  if (partial && Object.keys(fields).length === 0 &&
      [name, description, suggestion, type, severity, pats, enabled].every((x) => x === undefined)) {
    return { ok: false, fields: { body: "Provide at least one field to update." } };
  }
  if (Object.keys(fields).length) return { ok: false, fields };
  return { ok: true, value: { stableId, name, type, description, severity, patterns: pats, suggestion, enabled } };
}

export function validateReviewInput(body: unknown): Validated<{ brandId: string; content: string }> {
  const fields: Fields = {};
  if (!isObject(body)) return { ok: false, fields: { body: "Expected a JSON object." } };
  if (typeof body.brandId !== "string" || body.brandId.length === 0 || body.brandId.length > 100) fields.brandId = "A brand is required.";
  if (typeof body.content !== "string") fields.content = "Required.";
  else if (body.content.trim().length === 0) fields.content = "Content must not be empty.";
  else if (body.content.length > MAX_CONTENT_CHARS) fields.content = `Content must be at most ${MAX_CONTENT_CHARS.toLocaleString("en-US")} characters.`;
  if (Object.keys(fields).length) return { ok: false, fields };
  return { ok: true, value: { brandId: body.brandId as string, content: (body.content as string).trim() } };
}
