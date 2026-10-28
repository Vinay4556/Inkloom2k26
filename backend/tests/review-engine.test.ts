import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, findMatches } from "../src/services/review-engine.ts";
import type { EngineRule } from "../src/services/review-engine.ts";
import { demoBrands } from "../src/data/demo-brands.ts";
import { sampleContent } from "../src/data/samples.ts";

const morrow = demoBrands[0];

// Independent oracle: derive expected matches straight from the configured patterns.
function oracle(text: string): string[] {
  const lower = text.toLowerCase();
  const out: string[] = [];
  for (const rule of morrow.rules) {
    for (const p of rule.patterns) {
      let i = lower.indexOf(p.toLowerCase());
      while (i !== -1) {
        out.push(text.slice(i, i + p.length));
        i = lower.indexOf(p.toLowerCase(), i + p.length);
      }
    }
  }
  return out.sort();
}

test("compliant sample triggers no configured rule", () => {
  const r = analyze(sampleContent.compliant, morrow.rules);
  assert.equal(r.findings.length, 0);
  assert.equal(r.outcome, "no_rules_triggered");
});

test("restricted-phrases sample: findings equal rule-derived oracle", () => {
  const r = analyze(sampleContent.restrictedPhrases, morrow.rules);
  assert.deepEqual(r.findings.map((f) => f.matchedPhrase).sort(), oracle(sampleContent.restrictedPhrases));
  const phrases = r.findings.map((f) => f.matchedPhrase.toLowerCase());
  for (const p of ["miracle", "guaranteed", "risk-free"]) assert.ok(phrases.includes(p), p);
  assert.equal(r.outcome, "findings_require_review");
});

test("absolute-claim sample: findings equal rule-derived oracle", () => {
  const r = analyze(sampleContent.absoluteClaim, morrow.rules);
  assert.deepEqual(r.findings.map((f) => f.matchedPhrase).sort(), oracle(sampleContent.absoluteClaim));
  assert.ok(r.findings.some((f) => f.ruleId === "absolute-environmental-claim" && f.severity === "error"));
});

test("matching is case-insensitive and preserves original casing and offsets", () => {
  const text = "A MIRACLE cure";
  const r = analyze(text, morrow.rules);
  assert.equal(r.findings.length, 1);
  assert.equal(r.findings[0].matchedPhrase, "MIRACLE");
  assert.equal(text.slice(r.findings[0].index, r.findings[0].end), "MIRACLE");
});

test("repeated phrases yield one finding per occurrence with distinct ids", () => {
  const r = analyze("guaranteed, guaranteed, GUARANTEED", morrow.rules);
  assert.equal(r.findings.length, 3);
  assert.equal(new Set(r.findings.map((f) => f.id)).size, 3);
});

test("disabled rules are skipped", () => {
  const rules = morrow.rules.map((x) => (x.id === "restricted-phrases" ? { ...x, enabled: false } : x));
  const r = analyze("guaranteed miracle", rules);
  assert.equal(r.findings.length, 0);
  assert.equal(r.rulesEvaluated, 2);
});

test("severity and rule version are carried onto findings", () => {
  const rules: EngineRule[] = [
    { id: "a", type: "vague-superlative", severity: "warning", patterns: ["unbeatable"], explanation: "e", suggestion: "s", version: 4 },
  ];
  const [f] = analyze("Unbeatable price", rules).findings;
  assert.equal(f.severity, "warning");
  assert.equal(f.ruleVersion, 4);
});

test("overlapping patterns inside one rule collapse to the longest match", () => {
  const rules: EngineRule[] = [
    { id: "a", type: "absolute-claim", severity: "error", patterns: ["zero waste", "zero waste kitchen"], explanation: "", suggestion: "" },
  ];
  const r = analyze("Our Zero Waste Kitchen", rules);
  assert.equal(r.findings.length, 1);
  assert.equal(r.findings[0].matchedPhrase, "Zero Waste Kitchen");
});

test("different rules matching the same text are both reported", () => {
  const rules: EngineRule[] = [
    { id: "a", type: "absolute-claim", severity: "error", patterns: ["best"], explanation: "", suggestion: "" },
    { id: "b", type: "vague-superlative", severity: "warning", patterns: ["best"], explanation: "", suggestion: "" },
  ];
  assert.equal(analyze("the best", rules).findings.length, 2);
});

test("Unicode text: offsets stay correct with astral chars and special lowercasing", () => {
  const text = "İstanbul 🌿 is MIRACLE-grade";
  const r = analyze(text, morrow.rules);
  assert.equal(r.findings.length, 1);
  assert.equal(text.slice(r.findings[0].index, r.findings[0].end), "MIRACLE");
});

test("empty and whitespace input produce no findings and do not throw", () => {
  assert.equal(analyze("", morrow.rules).findings.length, 0);
  assert.equal(analyze("   \n", morrow.rules).findings.length, 0);
});

test("regex metacharacters in patterns are treated literally; empty patterns ignored", () => {
  assert.equal(findMatches("100% sure (really)", ["(really)", "", "  "]).length, 1);
  assert.equal(findMatches("a.b", ["a.b"]).length, 1);
  assert.equal(findMatches("axb", ["a.b"]).length, 0);
});

test("large input is handled in reasonable time", () => {
  const text = "lorem ipsum guaranteed ".repeat(2000);
  const t = Date.now();
  const r = analyze(text, morrow.rules);
  assert.equal(r.findings.length, 2000);
  assert.ok(Date.now() - t < 2000);
});
