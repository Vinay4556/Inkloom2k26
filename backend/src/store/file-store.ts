import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { demoBrands } from "../data/demo-brands.ts";
import { generateSampleReviews } from "../data/sample-reviews.ts";
import { analyze } from "../services/review-engine.ts";
import type { EngineRule } from "../services/review-engine.ts";
import { DEMO_ORG_ID, DEMO_USER_ID, StoreError } from "./types.ts";
import type {
  Brand, BrandRule, BrandWithCounts, Membership, Organization, ReviewListItem, ReviewRun, Store, Summary, User,
} from "./types.ts";

/**
 * Local, single-process, JSON-file-backed store.
 *
 * Intended for local development and tests only. It is NOT suitable for serverless hosting
 * (ephemeral disk) or multi-instance deployments. Production should use PostgreSQL
 * (see db/migrations/0000_init.sql and db/drizzle/schema.ts, not yet wired in).
 *
 * Every mutation runs inside a serialized transaction: read -> mutate -> write temp file -> rename.
 * If the mutation throws, nothing is written.
 */

interface Db {
  version: 1;
  organizations: Organization[];
  users: User[];
  memberships: Membership[];
  brands: Brand[];
  rules: BrandRule[];
  reviews: ReviewRun[];
}

const empty = (): Db => ({ version: 1, organizations: [], users: [], memberships: [], brands: [], rules: [], reviews: [] });
const nowIso = () => new Date().toISOString();

/** Idempotent: safe to run on every transaction. Returns true if it changed anything. */
function seedDemo(db: Db): boolean {
  let changed = false;
  const ts = nowIso();
  
  // Seed organization
  if (!db.organizations.some((o) => o.id === DEMO_ORG_ID)) {
    db.organizations.push({ id: DEMO_ORG_ID, name: "Inkloom Demo Workspace", createdAt: ts, updatedAt: ts });
    changed = true;
  }
  
  // Seed user
  if (!db.users.some((u) => u.id === DEMO_USER_ID)) {
    db.users.push({ id: DEMO_USER_ID, email: "demo-reviewer@example.invalid", displayName: "Demo reviewer", createdAt: ts });
    changed = true;
  }
  
  // Seed membership
  if (!db.memberships.some((m) => m.userId === DEMO_USER_ID && m.orgId === DEMO_ORG_ID)) {
    db.memberships.push({ userId: DEMO_USER_ID, orgId: DEMO_ORG_ID, role: "owner", createdAt: ts });
    changed = true;
  }
  
  // Seed brands and rules
  for (const demo of demoBrands) {
    if (!db.brands.some((b) => b.id === demo.id)) {
      db.brands.push({ id: demo.id, orgId: DEMO_ORG_ID, name: demo.name, description: demo.description, tone: demo.tone, isDemo: true, createdAt: ts, updatedAt: ts });
      changed = true;
    }
    for (const r of demo.rules) {
      const id = `rule_${demo.id}_${r.id}`;
      if (!db.rules.some((x) => x.id === id)) {
        db.rules.push({
          id, brandId: demo.id, stableId: r.id, name: r.id.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
          type: r.type, description: r.explanation, severity: r.severity, patterns: [...r.patterns],
          suggestion: r.suggestion, enabled: true, version: 1, createdAt: ts, updatedAt: ts,
        });
        changed = true;
      }
    }
  }
  
  // Seed sample reviews (for dashboard analytics)
  // Only seed if no reviews exist for demo org
  if (db.reviews.filter((r) => r.orgId === DEMO_ORG_ID).length === 0) {
    const sampleReviews = generateSampleReviews();
    
    for (const template of sampleReviews) {
      // Get brand rules for validation
      const brand = db.brands.find((b) => b.id === template.brandId && b.orgId === DEMO_ORG_ID);
      if (!brand) continue;
      
      const brandRules = db.rules.filter((r) => r.brandId === brand.id);
      
      // Convert to engine rules
      const engineRules: EngineRule[] = brandRules.map((r) => ({
        id: r.stableId,
        type: r.type,
        severity: r.severity,
        patterns: r.patterns,
        explanation: r.description,
        suggestion: r.suggestion,
        enabled: r.enabled,
        version: r.version,
      }));
      
      // Run actual validation
      const result = analyze(template.content || "", engineRules);
      
      // Calculate content fingerprint
      const contentFingerprint = createHash("sha256")
        .update(template.content || "", "utf8")
        .digest("hex");
      
      // Create timestamp (days ago)
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 7)); // Random day in last week
      reviewDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
      
      // Create review record
      const review: ReviewRun = {
        id: randomUUID(),
        orgId: DEMO_ORG_ID,
        brandId: brand.id,
        brandName: brand.name,
        brandIsDemo: true,
        createdBy: DEMO_USER_ID,
        ruleSnapshot: brandRules.map((r) => ({
          stableId: r.stableId,
          name: r.name,
          version: r.version,
          type: r.type,
          severity: r.severity,
          enabled: r.enabled,
          patterns: [...r.patterns],
        })),
        contentFingerprint,
        contentLength: template.content?.length || 0,
        content: template.content || null,
        summary: result.summary,
        outcome: result.outcome,
        findings: result.findings.map((f) => ({
          id: f.id,
          ruleStableId: f.ruleId,
          ruleVersion: f.ruleVersion,
          ruleType: f.ruleType,
          severity: f.severity,
          matchedPhrase: f.matchedPhrase,
          start: f.index,
          end: f.end,
          explanation: f.explanation,
          suggestion: f.suggestion,
        })),
        createdAt: reviewDate.toISOString(),
      };
      
      db.reviews.push(review);
      changed = true;
    }
  }
  
  return changed;
}

export function createFileStore(filePath: string): Store {
  let queue: Promise<unknown> = Promise.resolve();

  async function read(): Promise<Db> {
    try {
      const parsed = JSON.parse(await fs.readFile(filePath, "utf8")) as Db;
      if (parsed.version !== 1) throw new Error(`Unsupported data file version ${String(parsed.version)}`);
      return parsed;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return empty();
      throw err; // corrupt file: surface it, never silently reset user data
    }
  }
  async function write(db: Db): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, filePath);
  }
  /** Serialized transaction. fn mutates a private copy; the file is only written if fn returns without throwing. */
  function tx<T>(fn: (db: Db) => T, opts: { mutates: boolean }): Promise<T> {
    const run = async (): Promise<T> => {
      const db = await read();
      const seeded = seedDemo(db);
      const result = fn(db);
      if (opts.mutates || seeded) await write(db);
      return result;
    };
    const next = queue.then(run, run);
    queue = next.catch(() => undefined);
    return next;
  }

  const brandOf = (db: Db, orgId: string, brandId: string): Brand => {
    const b = db.brands.find((x) => x.id === brandId && x.orgId === orgId);
    if (!b) throw new StoreError("not_found", "Brand not found.");
    return b;
  };

  return {
    kind: "file",
    isMember: (userId, orgId) => tx((db) => db.memberships.some((m) => m.userId === userId && m.orgId === orgId), { mutates: false }),

    listBrands: (orgId) => tx((db): BrandWithCounts[] =>
      db.brands.filter((b) => b.orgId === orgId).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name))
        .map((b) => {
          const rules = db.rules.filter((r) => r.brandId === b.id);
          return { ...b, ruleCount: rules.length, enabledRuleCount: rules.filter((r) => r.enabled).length };
        }), { mutates: false }),

    getBrand: (orgId, brandId) => tx((db) => db.brands.find((b) => b.id === brandId && b.orgId === orgId) ?? null, { mutates: false }),

    createBrand: (orgId, input) => tx((db) => {
      const ts = nowIso();
      const brand: Brand = { id: randomUUID(), orgId, name: input.name, description: input.description, tone: input.tone, isDemo: false, createdAt: ts, updatedAt: ts };
      db.brands.push(brand);
      return brand;
    }, { mutates: true }),

    updateBrand: (orgId, brandId, patch) => tx((db) => {
      const b = brandOf(db, orgId, brandId);
      if (patch.name !== undefined) b.name = patch.name;
      if (patch.description !== undefined) b.description = patch.description;
      if (patch.tone !== undefined) b.tone = patch.tone;
      b.updatedAt = nowIso();
      return b;
    }, { mutates: true }),

    listRules: (orgId, brandId) => tx((db) => {
      brandOf(db, orgId, brandId);
      return db.rules.filter((r) => r.brandId === brandId).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.stableId.localeCompare(b.stableId));
    }, { mutates: false }),

    createRule: (orgId, brandId, input) => tx((db) => {
      brandOf(db, orgId, brandId);
      if (db.rules.some((r) => r.brandId === brandId && r.stableId === input.stableId)) {
        throw new StoreError("conflict", "A rule with this identifier already exists for this brand.");
      }
      const ts = nowIso();
      const rule: BrandRule = { ...input, id: randomUUID(), brandId, version: 1, createdAt: ts, updatedAt: ts };
      db.rules.push(rule);
      return rule;
    }, { mutates: true }),

    updateRule: (orgId, brandId, ruleId, patch) => tx((db) => {
      brandOf(db, orgId, brandId);
      const rule = db.rules.find((r) => r.id === ruleId && r.brandId === brandId);
      if (!rule) throw new StoreError("not_found", "Rule not found.");
      let changed = false;
      for (const key of ["name", "type", "description", "severity", "suggestion", "enabled"] as const) {
        const v = patch[key];
        if (v !== undefined && v !== rule[key]) { (rule as unknown as Record<string, unknown>)[key] = v; changed = true; }
      }
      if (patch.patterns !== undefined && JSON.stringify(patch.patterns) !== JSON.stringify(rule.patterns)) {
        rule.patterns = [...patch.patterns]; changed = true;
      }
      if (changed) { rule.version += 1; rule.updatedAt = nowIso(); }
      return rule;
    }, { mutates: true }),

    createReview: (orgId, review) => tx((db) => {
      brandOf(db, orgId, review.brandId);
      const run: ReviewRun = { ...review, id: randomUUID(), orgId, createdAt: nowIso() };
      db.reviews.push(run);
      return run;
    }, { mutates: true }),

    listReviews: (orgId, { limit, cursor, brandId }) => tx((db) => {
      const all = db.reviews.filter((r) => r.orgId === orgId && (!brandId || r.brandId === brandId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
      let start = 0;
      if (cursor) {
        const sep = cursor.indexOf("|");
        const cAt = cursor.slice(0, sep), cId = cursor.slice(sep + 1);
        start = all.findIndex((r) => r.createdAt < cAt || (r.createdAt === cAt && r.id < cId));
        if (start === -1) start = all.length;
      }
      const page = all.slice(start, start + limit);
      const last = page[page.length - 1];
      const hasMore = start + limit < all.length;
      const items: ReviewListItem[] = page.map((r) => ({
        id: r.id, brandId: r.brandId, brandName: r.brandName, brandIsDemo: r.brandIsDemo, outcome: r.outcome,
        summary: r.summary, contentLength: r.contentLength, contentFingerprint: r.contentFingerprint, createdAt: r.createdAt,
      }));
      return { items, nextCursor: hasMore && last ? `${last.createdAt}|${last.id}` : null };
    }, { mutates: false }),

    getReview: (orgId, reviewId) => tx((db) => db.reviews.find((r) => r.id === reviewId && r.orgId === orgId) ?? null, { mutates: false }),

    deleteReview: (orgId, reviewId) => tx((db) => {
      const i = db.reviews.findIndex((r) => r.id === reviewId && r.orgId === orgId);
      if (i === -1) return false;
      db.reviews.splice(i, 1);
      return true;
    }, { mutates: true }),

    summary: (orgId): Promise<Summary> => tx((db) => {
      const brandIds = new Set(db.brands.filter((b) => b.orgId === orgId).map((b) => b.id));
      const reviews = db.reviews.filter((r) => r.orgId === orgId);
      return {
        brands: brandIds.size,
        enabledRules: db.rules.filter((r) => brandIds.has(r.brandId) && r.enabled).length,
        reviews: reviews.length,
        reviewsWithFindings: reviews.filter((r) => r.summary.total > 0).length,
        lastReviewAt: reviews.reduce<string | null>((m, r) => (m === null || r.createdAt > m ? r.createdAt : m), null),
      };
    }, { mutates: false }),
  };
}
