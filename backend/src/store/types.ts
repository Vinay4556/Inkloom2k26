import type { RuleType, Severity, ReviewOutcome } from "../services/review-engine.ts";

export const DEMO_ORG_ID = "org_demo";
export const DEMO_USER_ID = "user_demo_reviewer";

export interface Organization { id: string; name: string; createdAt: string; updatedAt: string }
export interface User { id: string; email: string; displayName: string; createdAt: string }
export interface Membership { userId: string; orgId: string; role: "owner" | "reviewer" | "viewer"; createdAt: string }

export interface Brand {
  id: string;
  orgId: string;
  name: string;
  description: string;
  tone: string;
  /** true for illustrative fictional demo brands such as Morrow Goods. */
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandRule {
  id: string;
  brandId: string;
  /** Stable identifier, unique within a brand. Recorded on findings. */
  stableId: string;
  name: string;
  type: RuleType;
  /** Shown with each finding as the explanation. */
  description: string;
  severity: Severity;
  patterns: string[];
  suggestion: string;
  enabled: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface RuleSnapshotEntry {
  stableId: string;
  name: string;
  version: number;
  type: RuleType;
  severity: Severity;
  enabled: boolean;
  patterns: string[];
}

export interface ReviewFindingRecord {
  id: string;
  ruleStableId: string;
  ruleVersion: number;
  ruleType: RuleType;
  severity: Severity;
  matchedPhrase: string;
  start: number;
  end: number;
  explanation: string;
  suggestion: string;
}

export interface ReviewRun {
  id: string;
  orgId: string;
  brandId: string;
  brandName: string;
  brandIsDemo: boolean;
  createdBy: string;
  /** Immutable copy of the rules evaluated, so the analysis can be explained later. */
  ruleSnapshot: RuleSnapshotEntry[];
  contentFingerprint: string;
  contentLength: number;
  /** Present only when INKLOOM_RETAIN_CONTENT=true. */
  content: string | null;
  summary: { total: number; errors: number; warnings: number };
  outcome: ReviewOutcome;
  findings: ReviewFindingRecord[];
  createdAt: string;
}

export type BrandWithCounts = Brand & { ruleCount: number; enabledRuleCount: number };

export interface ReviewListItem {
  id: string; brandId: string; brandName: string; brandIsDemo: boolean;
  outcome: ReviewOutcome; summary: ReviewRun["summary"]; contentLength: number;
  contentFingerprint: string; createdAt: string;
}

export interface Summary {
  brands: number; enabledRules: number; reviews: number;
  reviewsWithFindings: number; lastReviewAt: string | null;
}

export type StoreErrorCode = "not_found" | "conflict";
export class StoreError extends Error {
  code: StoreErrorCode;
  constructor(code: StoreErrorCode, message: string) {
    super(message);
    this.name = "StoreError";
    this.code = code;
  }
}

/** Every method is scoped by orgId. A store must never return another org's rows. */
export interface Store {
  kind: string;
  isMember(userId: string, orgId: string): Promise<boolean>;
  listBrands(orgId: string): Promise<BrandWithCounts[]>;
  getBrand(orgId: string, brandId: string): Promise<Brand | null>;
  createBrand(orgId: string, input: { name: string; description: string; tone: string }): Promise<Brand>;
  updateBrand(orgId: string, brandId: string, patch: Partial<{ name: string; description: string; tone: string }>): Promise<Brand>;
  listRules(orgId: string, brandId: string): Promise<BrandRule[]>;
  createRule(orgId: string, brandId: string, input: Omit<BrandRule, "id" | "brandId" | "version" | "createdAt" | "updatedAt">): Promise<BrandRule>;
  updateRule(orgId: string, brandId: string, ruleId: string, patch: Partial<Pick<BrandRule, "name" | "type" | "description" | "severity" | "patterns" | "suggestion" | "enabled">>): Promise<BrandRule>;
  /** Atomically persists a review (all findings or nothing). */
  createReview(orgId: string, review: Omit<ReviewRun, "id" | "orgId" | "createdAt">): Promise<ReviewRun>;
  listReviews(orgId: string, opts: { limit: number; cursor?: string; brandId?: string }): Promise<{ items: ReviewListItem[]; nextCursor: string | null }>;
  getReview(orgId: string, reviewId: string): Promise<ReviewRun | null>;
  deleteReview(orgId: string, reviewId: string): Promise<boolean>;
  summary(orgId: string): Promise<Summary>;
}
