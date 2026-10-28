import { createHash } from "node:crypto";
import { analyze } from "../services/review-engine.ts";
import { calculateAnalytics } from "../services/analytics.ts";
import type { EngineRule } from "../services/review-engine.ts";
import { StoreError } from "../store/types.ts";
import type { Store, ReviewRun } from "../store/types.ts";
import { validateBrandInput, validateReviewInput, validateRuleInput } from "../validation/validate.ts";
import type { Fields } from "../validation/validate.ts";

export interface Session { userId: string; orgId: string; mode: "demo" }
export interface ApiDeps {
  store: Store;
  /** Resolves the caller from server-side state only. Never from client-supplied org ids. */
  getSession: (req: Request) => Promise<Session | null>;
  retainContent: boolean;
}

const MAX_BODY_BYTES = 128 * 1024;

class HttpError extends Error {
  status: number; code: string; fields?: Fields;
  constructor(status: number, code: string, message: string, fields?: Fields) {
    super(message); this.name = "HttpError"; this.status = status; this.code = code; this.fields = fields;
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-inkloom-mode": "demo", "x-content-type-options": "nosniff" },
  });
}

export function createApi(deps: ApiDeps) {
  const { store } = deps;

  async function authorize(req: Request, write: boolean): Promise<Session> {
    if (write) {
      // CSRF defence for cookie-less demo sessions: require same-origin, JSON requests.
      const origin = req.headers.get("origin");
      const host = req.headers.get("host");
      if (origin) {
        let originHost: string | null = null;
        try { originHost = new URL(origin).host; } catch { /* invalid */ }
        if (!host || originHost !== host) throw new HttpError(403, "forbidden_origin", "Cross-origin requests are not allowed.");
      }
      if (req.method !== "DELETE" && !(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
        throw new HttpError(415, "unsupported_media_type", "Content-Type must be application/json.");
      }
    }
    const session = await deps.getSession(req);
    if (!session) throw new HttpError(401, "unauthenticated", "Authentication required.");
    if (!(await store.isMember(session.userId, session.orgId))) throw new HttpError(403, "forbidden", "You do not have access to this organization.");
    return session;
  }

  async function body(req: Request): Promise<unknown> {
    const declared = Number(req.headers.get("content-length") ?? "0");
    if (declared > MAX_BODY_BYTES) throw new HttpError(413, "payload_too_large", "Request body is too large.");
    const text = await req.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) throw new HttpError(413, "payload_too_large", "Request body is too large.");
    try { return JSON.parse(text); } catch { throw new HttpError(400, "invalid_json", "Request body is not valid JSON."); }
  }

  function fail(fields: Fields): never {
    throw new HttpError(422, "validation_failed", "Some fields are invalid.", fields);
  }

  function handler<A extends unknown[]>(fn: (req: Request, ...args: A) => Promise<Response>) {
    return async (req: Request, ...args: A): Promise<Response> => {
      try {
        return await fn(req, ...args);
      } catch (err) {
        if (err instanceof HttpError) {
          return json({ error: { code: err.code, message: err.message, ...(err.fields ? { fields: err.fields } : {}) } }, err.status);
        }
        if (err instanceof StoreError) {
          const status = err.code === "not_found" ? 404 : 409;
          return json({ error: { code: err.code, message: err.message } }, status);
        }
        // Never log request bodies or submitted content.
        console.error("[inkloom] unhandled error:", err);
        return json({ error: { code: "internal_error", message: "Something went wrong on the server." } }, 500);
      }
    };
  }

  const toEngineRules = (rules: Awaited<ReturnType<Store["listRules"]>>): EngineRule[] =>
    rules.map((r) => ({ id: r.stableId, type: r.type, severity: r.severity, patterns: r.patterns, explanation: r.description, suggestion: r.suggestion, enabled: r.enabled, version: r.version }));

  const present = (r: ReviewRun) => ({ ...r, orgId: undefined });

  return {
    health: handler(async () => json({
      data: { status: "ok", store: store.kind, mode: "demo-no-authentication",
        notice: "Local demo environment. There is no real user authentication; actions are attributed to a demo reviewer.", retainContent: deps.retainContent },
    })),

    summary: handler(async (req) => { const s = await authorize(req, false); return json({ data: await store.summary(s.orgId) }); }),

    listBrands: handler(async (req) => { const s = await authorize(req, false); return json({ data: await store.listBrands(s.orgId) }); }),

    createBrand: handler(async (req) => {
      const s = await authorize(req, true);
      const v = validateBrandInput(await body(req), false);
      if (!v.ok) fail(v.fields);
      const brand = await store.createBrand(s.orgId, { name: v.value.name!, description: v.value.description ?? "", tone: v.value.tone ?? "" });
      return json({ data: brand }, 201);
    }),

    getBrand: handler(async (req, brandId: string) => {
      const s = await authorize(req, false);
      const brand = await store.getBrand(s.orgId, brandId);
      if (!brand) throw new HttpError(404, "not_found", "Brand not found.");
      return json({ data: brand });
    }),

    updateBrand: handler(async (req, brandId: string) => {
      const s = await authorize(req, true);
      const v = validateBrandInput(await body(req), true);
      if (!v.ok) fail(v.fields);
      return json({ data: await store.updateBrand(s.orgId, brandId, v.value) });
    }),

    listRules: handler(async (req, brandId: string) => {
      const s = await authorize(req, false);
      return json({ data: await store.listRules(s.orgId, brandId) });
    }),

    createRule: handler(async (req, brandId: string) => {
      const s = await authorize(req, true);
      const v = validateRuleInput(await body(req), false);
      if (!v.ok) fail(v.fields);
      const x = v.value;
      const rule = await store.createRule(s.orgId, brandId, {
        stableId: x.stableId!, name: x.name!, type: x.type!, description: x.description!, severity: x.severity!,
        patterns: x.patterns!, suggestion: x.suggestion ?? "", enabled: x.enabled ?? true,
      });
      return json({ data: rule }, 201);
    }),

    updateRule: handler(async (req, brandId: string, ruleId: string) => {
      const s = await authorize(req, true);
      const v = validateRuleInput(await body(req), true);
      if (!v.ok) fail(v.fields);
      const { stableId: _ignored, ...patch } = v.value;
      void _ignored;
      return json({ data: await store.updateRule(s.orgId, brandId, ruleId, patch) });
    }),

    createReview: handler(async (req) => {
      const s = await authorize(req, true);
      const v = validateReviewInput(await body(req));
      if (!v.ok) fail(v.fields);
      const brand = await store.getBrand(s.orgId, v.value.brandId);
      if (!brand) throw new HttpError(404, "not_found", "Brand not found.");
      const rules = await store.listRules(s.orgId, brand.id);
      const result = analyze(v.value.content, toEngineRules(rules));
      const review = await store.createReview(s.orgId, {
        brandId: brand.id, brandName: brand.name, brandIsDemo: brand.isDemo, createdBy: s.userId,
        ruleSnapshot: rules.map((r) => ({ stableId: r.stableId, name: r.name, version: r.version, type: r.type, severity: r.severity, enabled: r.enabled, patterns: [...r.patterns] })),
        contentFingerprint: createHash("sha256").update(v.value.content, "utf8").digest("hex"),
        contentLength: v.value.content.length,
        content: deps.retainContent ? v.value.content : null,
        summary: result.summary, outcome: result.outcome,
        findings: result.findings.map((f) => ({
          id: f.id, ruleStableId: f.ruleId, ruleVersion: f.ruleVersion, ruleType: f.ruleType, severity: f.severity,
          matchedPhrase: f.matchedPhrase, start: f.index, end: f.end, explanation: f.explanation, suggestion: f.suggestion,
        })),
      });
      return json({ data: present(review) }, 201);
    }),

    listReviews: handler(async (req) => {
      const s = await authorize(req, false);
      const url = new URL(req.url);
      const rawLimit = url.searchParams.get("limit");
      const limit = rawLimit === null ? 20 : Number(rawLimit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 50) fail({ limit: "Must be an integer from 1 to 50." });
      const cursor = url.searchParams.get("cursor") ?? undefined;
      if (cursor !== undefined && !/^[0-9T:.\-Z]+\|[0-9a-f-]+$/i.test(cursor)) fail({ cursor: "Invalid cursor." });
      const brandId = url.searchParams.get("brandId") ?? undefined;
      const page = await store.listReviews(s.orgId, { limit, cursor, brandId });
      return json({ data: page.items, nextCursor: page.nextCursor });
    }),

    getReview: handler(async (req, reviewId: string) => {
      const s = await authorize(req, false);
      const review = await store.getReview(s.orgId, reviewId);
      if (!review) throw new HttpError(404, "not_found", "Review not found.");
      return json({ data: present(review) });
    }),

    deleteReview: handler(async (req, reviewId: string) => {
      const s = await authorize(req, true);
      if (!(await store.deleteReview(s.orgId, reviewId))) throw new HttpError(404, "not_found", "Review not found.");
      return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
    }),

    analytics: handler(async (req) => {
      const s = await authorize(req, false);
      const url = new URL(req.url);
      
      // Parse date range
      const days = Number(url.searchParams.get("days") ?? "30");
      if (!Number.isInteger(days) || days < 1 || days > 365) {
        fail({ days: "Must be an integer from 1 to 365." });
      }
      
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);
      
      const brandId = url.searchParams.get("brandId") ?? undefined;
      
      // Fetch all reviews in date range (we need full reviews for analytics)
      // This is not efficient for large datasets but works for demo purposes
      const allReviews: ReviewRun[] = [];
      let cursor: string | undefined = undefined;
      
      // Fetch paginated reviews until we have all within date range
      do {
        const page = await store.listReviews(s.orgId, { limit: 50, cursor, brandId });
        
        // Fetch full review details for items in date range
        for (const item of page.items) {
          const reviewDate = new Date(item.createdAt);
          if (reviewDate >= startDate && reviewDate <= endDate) {
            const fullReview = await store.getReview(s.orgId, item.id);
            if (fullReview) {
              allReviews.push(fullReview);
            }
          }
        }
        
        cursor = page.nextCursor ?? undefined;
        
        // Stop if we've gone past the start date
        if (page.items.length > 0) {
          const oldestInPage = new Date(page.items[page.items.length - 1].createdAt);
          if (oldestInPage < startDate) {
            break;
          }
        }
      } while (cursor);
      
      const analytics = calculateAnalytics(allReviews, startDate, endDate);
      return json({ data: analytics });
    }),
  };
}

export type Api = ReturnType<typeof createApi>;
