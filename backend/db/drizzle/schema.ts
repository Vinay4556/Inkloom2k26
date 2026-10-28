// NOT COMPILED OR RUN: drizzle-orm is not installed and the registry was unreachable.
// Mirrors db/migrations/0000_init.sql. Treat the SQL file as authoritative until this is verified.
// Needs: npm i drizzle-orm pg  &&  npm i -D drizzle-kit
import { pgTable, text, boolean, integer, jsonb, timestamp, primaryKey, index, unique, char } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(), name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const users = pgTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull().unique(), displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const memberships = pgTable("memberships", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.orgId] })]);
export const brands = pgTable("brands", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(), description: text("description").notNull().default(""), tone: text("tone").notNull().default(""),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("brands_org_idx").on(t.orgId)]);
export const brandRules = pgTable("brand_rules", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  stableId: text("stable_id").notNull(), name: text("name").notNull(), type: text("type").notNull(),
  description: text("description").notNull(), severity: text("severity").notNull(),
  patterns: jsonb("patterns").$type<string[]>().notNull(), suggestion: text("suggestion").notNull().default(""),
  enabled: boolean("enabled").notNull().default(true), version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.brandId, t.stableId)]);
export const reviewRuns = pgTable("review_runs", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "restrict" }),
  brandName: text("brand_name").notNull(), brandIsDemo: boolean("brand_is_demo").notNull(),
  createdBy: text("created_by").notNull().references(() => users.id),
  ruleSnapshot: jsonb("rule_snapshot").notNull(), contentFingerprint: char("content_fingerprint", { length: 64 }).notNull(),
  contentLength: integer("content_length").notNull(), content: text("content"),
  findingTotal: integer("finding_total").notNull(), findingErrors: integer("finding_errors").notNull(), findingWarnings: integer("finding_warnings").notNull(),
  outcome: text("outcome").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("review_runs_org_created_idx").on(t.orgId, t.createdAt, t.id)]);
export const reviewFindings = pgTable("review_findings", {
  id: text("id").notNull(),
  reviewRunId: text("review_run_id").notNull().references(() => reviewRuns.id, { onDelete: "cascade" }),
  ruleStableId: text("rule_stable_id").notNull(), ruleVersion: integer("rule_version").notNull(), ruleType: text("rule_type").notNull(),
  severity: text("severity").notNull(), matchedPhrase: text("matched_phrase").notNull(),
  startOffset: integer("start_offset").notNull(), endOffset: integer("end_offset").notNull(),
  explanation: text("explanation").notNull(), suggestion: text("suggestion").notNull(),
}, (t) => [primaryKey({ columns: [t.reviewRunId, t.id] })]);
