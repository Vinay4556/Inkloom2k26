import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createApi } from "../src/middleware/api.ts";
import type { Session } from "../src/middleware/api.ts";
import { createFileStore } from "../src/store/file-store.ts";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../src/store/types.ts";
import { sampleContent } from "../src/data/samples.ts";

let dir: string;
let file: string;
let session: Session;
let retain = false;
const store = () => createFileStore(file);
const mk = () => createApi({ store: store(), getSession: async () => session, retainContent: retain });
const H = { "content-type": "application/json", host: "localhost:3000" };
const post = (url: string, b: unknown, extra: Record<string, string> = {}) =>
  new Request(`http://localhost:3000${url}`, { method: "POST", headers: { ...H, ...extra }, body: JSON.stringify(b) });
const patch = (url: string, b: unknown) => new Request(`http://localhost:3000${url}`, { method: "PATCH", headers: H, body: JSON.stringify(b) });
const get = (url: string) => new Request(`http://localhost:3000${url}`);
const j = async (r: Response) => (await r.json()) as any;

before(async () => { dir = await mkdtemp(path.join(tmpdir(), "inkloom-")); file = path.join(dir, "db.json"); session = { userId: DEMO_USER_ID, orgId: DEMO_ORG_ID, mode: "demo" }; });
after(async () => { await rm(dir, { recursive: true, force: true }); });

test("seed: Morrow Goods and its 3 rules load, flagged as demo, and reseeding is idempotent", async () => {
  const api = mk();
  const b1 = (await j(await api.listBrands(get("/api/brands")))).data;
  const b2 = (await j(await mk().listBrands(get("/api/brands")))).data;
  assert.equal(b1.length, 1);
  assert.equal(b1[0].id, "morrow-goods");
  assert.equal(b1[0].isDemo, true);
  assert.equal(b1[0].ruleCount, 3);
  assert.deepEqual(b1, b2);
});

test("review of each sample persists findings and can be re-read", async () => {
  const api = mk();
  const run = async (content: string) => j(await api.createReview(post("/api/reviews", { brandId: "morrow-goods", content })));
  const compliant = await run(sampleContent.compliant);
  assert.equal(compliant.data.outcome, "no_rules_triggered");
  const restricted = await run(sampleContent.restrictedPhrases);
  assert.equal(restricted.data.outcome, "findings_require_review");
  assert.equal(restricted.data.summary.total, 5);
  const absolute = await run(sampleContent.absoluteClaim);
  assert.equal(absolute.data.summary.total, 8);
  assert.equal(absolute.data.content, null, "content must not be retained by default");
  assert.equal(absolute.data.contentFingerprint.length, 64);
  assert.equal(absolute.data.ruleSnapshot.length, 3);
  const again = await j(await mk().getReview(get(`/api/reviews/${restricted.data.id}`), restricted.data.id));
  assert.deepEqual(again.data.findings, restricted.data.findings);
  assert.equal(again.data.orgId, undefined);
});

test("history lists persisted reviews newest first and paginates without duplicates", async () => {
  const api = mk();
  for (let i = 0; i < 3; i++) await api.createReview(post("/api/reviews", { brandId: "morrow-goods", content: `guaranteed ${i}` }));
  const p1 = await j(await api.listReviews(get("/api/reviews?limit=2")));
  assert.equal(p1.data.length, 2);
  assert.ok(p1.nextCursor);
  const p2 = await j(await api.listReviews(get(`/api/reviews?limit=2&cursor=${encodeURIComponent(p1.nextCursor)}`)));
  const ids = [...p1.data, ...p2.data].map((x: any) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  const all = await j(await api.listReviews(get("/api/reviews?limit=50")));
  assert.deepEqual(all.data.map((x: any) => x.createdAt), [...all.data.map((x: any) => x.createdAt)].sort().reverse());
});

test("validation: empty, oversized, missing brand, bad JSON, bad content-type, bad limit", async () => {
  const api = mk();
  assert.equal((await api.createReview(post("/api/reviews", { brandId: "morrow-goods", content: "   " }))).status, 422);
  assert.equal((await api.createReview(post("/api/reviews", { brandId: "morrow-goods", content: "x".repeat(10001) }))).status, 422);
  assert.equal((await api.createReview(post("/api/reviews", { content: "hi" }))).status, 422);
  assert.equal((await api.createReview(post("/api/reviews", { brandId: "nope", content: "hi" }))).status, 404);
  assert.equal((await api.createReview(new Request("http://localhost:3000/api/reviews", { method: "POST", headers: H, body: "{oops" }))).status, 400);
  assert.equal((await api.createReview(new Request("http://localhost:3000/api/reviews", { method: "POST", headers: { host: "localhost:3000", "content-type": "text/plain" }, body: "{}" }))).status, 415);
  assert.equal((await api.listReviews(get("/api/reviews?limit=999"))).status, 422);
  const res = await j(await api.createReview(post("/api/reviews", { brandId: "morrow-goods", content: "" })));
  assert.equal(res.error.code, "validation_failed");
  assert.ok(res.error.fields.content);
});

test("cross-origin writes are rejected", async () => {
  const api = mk();
  const r = await api.createBrand(post("/api/brands", { name: "X" }, { origin: "https://evil.example" }));
  assert.equal(r.status, 403);
  const ok = await api.createBrand(post("/api/brands", { name: "Same origin" }, { origin: "http://localhost:3000" }));
  assert.equal(ok.status, 201);
});

test("brand + rule CRUD, versioning, and disabled rules are excluded from analysis", async () => {
  const api = mk();
  const brand = (await j(await api.createBrand(post("/api/brands", { name: "Acme Test", description: "d" })))).data;
  assert.equal(brand.isDemo, false);
  assert.equal((await api.updateBrand(patch(`/api/brands/${brand.id}`, {}), brand.id)).status, 422);
  const upd = (await j(await api.updateBrand(patch(`/api/brands/${brand.id}`, { tone: "Plain" }), brand.id))).data;
  assert.equal(upd.tone, "Plain");

  const bad = await api.createRule(post(`/api/brands/${brand.id}/rules`, { name: "x", type: "nope", severity: "error", description: "d", patterns: [] }), brand.id);
  assert.equal(bad.status, 422);
  const created = await api.createRule(post(`/api/brands/${brand.id}/rules`, { name: "No hype", type: "vague-superlative", severity: "warning", description: "Hype", patterns: ["Amazing", "amazing", "stellar"], suggestion: "Be specific" }), brand.id);
  assert.equal(created.status, 201);
  const rule = (await j(created)).data;
  assert.equal(rule.stableId, "no-hype");
  assert.deepEqual(rule.patterns, ["Amazing", "stellar"]);
  assert.equal(rule.version, 1);
  const dup = await api.createRule(post(`/api/brands/${brand.id}/rules`, { name: "No hype", type: "vague-superlative", severity: "warning", description: "d", patterns: ["a"] }), brand.id);
  assert.equal(dup.status, 409);

  const r1 = await j(await api.createReview(post("/api/reviews", { brandId: brand.id, content: "An amazing, stellar product" })));
  assert.equal(r1.data.summary.total, 2);
  assert.equal(r1.data.findings[0].ruleVersion, 1);

  const off = (await j(await api.updateRule(patch(`/api/brands/${brand.id}/rules/${rule.id}`, { enabled: false }), brand.id, rule.id))).data;
  assert.equal(off.version, 2);
  const noop = (await j(await api.updateRule(patch(`/api/brands/${brand.id}/rules/${rule.id}`, { enabled: false }), brand.id, rule.id))).data;
  assert.equal(noop.version, 2, "no-op update must not bump version");
  assert.equal((await api.updateRule(patch(`/api/brands/${brand.id}/rules/${rule.id}`, { stableId: "changed" }), brand.id, rule.id)).status, 422);
  const r2 = await j(await api.createReview(post("/api/reviews", { brandId: brand.id, content: "An amazing, stellar product" })));
  assert.equal(r2.data.summary.total, 0);
  // the earlier review still records the rule as it was (snapshot), unaffected by later edits
  const old = await j(await api.getReview(get(`/api/reviews/${r1.data.id}`), r1.data.id));
  assert.equal(old.data.ruleSnapshot[0].enabled, true);
  assert.equal(old.data.ruleSnapshot[0].version, 1);
  assert.equal(r2.data.ruleSnapshot[0].version, 2);
});

test("organization isolation: another org cannot read, write, list, or delete", async () => {
  const api = mk();
  const mine = await j(await api.createReview(post("/api/reviews", { brandId: "morrow-goods", content: "guaranteed" })));
  // second org with its own member, inserted directly in the data file through a fresh store
  const raw = JSON.parse(await readFile(file, "utf8"));
  raw.organizations.push({ id: "org_b", name: "B", createdAt: "x", updatedAt: "x" });
  raw.users.push({ id: "user_b", email: "b@example.invalid", displayName: "B", createdAt: "x" });
  raw.memberships.push({ userId: "user_b", orgId: "org_b", role: "owner", createdAt: "x" });
  const { writeFile } = await import("node:fs/promises");
  await writeFile(file, JSON.stringify(raw));
  session = { userId: "user_b", orgId: "org_b", mode: "demo" };
  try {
    const b = mk();
    assert.deepEqual((await j(await b.listBrands(get("/api/brands")))).data, []);
    assert.equal((await b.getBrand(get("/api/brands/morrow-goods"), "morrow-goods")).status, 404);
    assert.equal((await b.listRules(get("/x"), "morrow-goods")).status, 404);
    assert.equal((await b.createReview(post("/api/reviews", { brandId: "morrow-goods", content: "guaranteed" }))).status, 404);
    assert.equal((await b.getReview(get("/x"), mine.data.id)).status, 404);
    assert.equal((await b.deleteReview(new Request("http://localhost:3000/x", { method: "DELETE", headers: { host: "localhost:3000" } }), mine.data.id)).status, 404);
    assert.equal((await j(await b.listReviews(get("/api/reviews")))).data.length, 0);
    assert.equal((await j(await b.summary(get("/api/summary")))).data.reviews, 0);
    // a user who is not a member of the claimed org is refused outright
    session = { userId: "user_b", orgId: DEMO_ORG_ID, mode: "demo" };
    assert.equal((await mk().listBrands(get("/api/brands"))).status, 403);
  } finally {
    session = { userId: DEMO_USER_ID, orgId: DEMO_ORG_ID, mode: "demo" };
  }
  assert.equal((await mk().getReview(get("/x"), mine.data.id)).status, 200);
});

test("unauthenticated requests get 401", async () => {
  const api = createApi({ store: store(), getSession: async () => null, retainContent: false });
  assert.equal((await api.listBrands(get("/api/brands"))).status, 401);
});

test("content is retained only when explicitly configured; delete removes the review", async () => {
  retain = true;
  try {
    const api = mk();
    const r = await j(await api.createReview(post("/api/reviews", { brandId: "morrow-goods", content: "miracle" })));
    assert.equal(r.data.content, "miracle");
    const del = await api.deleteReview(new Request("http://localhost:3000/x", { method: "DELETE", headers: { host: "localhost:3000" } }), r.data.id);
    assert.equal(del.status, 204);
    assert.equal((await api.getReview(get("/x"), r.data.id)).status, 404);
  } finally { retain = false; }
});

test("summary counts are derived from persisted records", async () => {
  const s = (await j(await mk().summary(get("/api/summary")))).data;
  const list = (await j(await mk().listReviews(get("/api/reviews?limit=50")))).data;
  assert.equal(s.reviews, list.length);
  assert.equal(s.reviewsWithFindings, list.filter((x: any) => x.summary.total > 0).length);
});

test("concurrent writes are serialized and none are lost", async () => {
  const before = (await j(await mk().summary(get("/x")))).data.reviews;
  const api = mk();
  await Promise.all(Array.from({ length: 10 }, (_, i) => api.createReview(post("/api/reviews", { brandId: "morrow-goods", content: `risk-free ${i}` }))));
  assert.equal((await j(await mk().summary(get("/x")))).data.reviews, before + 10);
});

test("a corrupt data file surfaces a 500 and is not overwritten", async () => {
  const { writeFile } = await import("node:fs/promises");
  const bad = path.join(dir, "bad.json");
  await writeFile(bad, "{not json");
  const api = createApi({ store: createFileStore(bad), getSession: async () => session, retainContent: false });
  const origErr = console.error; console.error = () => {};
  try { assert.equal((await api.listBrands(get("/api/brands"))).status, 500); } finally { console.error = origErr; }
  assert.equal(await readFile(bad, "utf8"), "{not json");
});
