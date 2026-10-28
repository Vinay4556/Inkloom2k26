-- Inkloom initial PostgreSQL schema (NOT yet executed or wired into the app; reviewed by hand only).
-- Apply with: psql "$DATABASE_URL" -f db/migrations/0000_init.sql
-- Roll back with: db/migrations/0000_init.down.sql
BEGIN;

CREATE TABLE organizations (
  id          text PRIMARY KEY,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id            text PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  display_name  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
  user_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id      text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('owner','reviewer','viewer')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
);

CREATE TABLE brands (
  id          text PRIMARY KEY,
  org_id      text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  tone        text NOT NULL DEFAULT '' CHECK (char_length(tone) <= 200),
  is_demo     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX brands_org_idx ON brands (org_id);

CREATE TABLE brand_rules (
  id          text PRIMARY KEY,
  brand_id    text NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  stable_id   text NOT NULL CHECK (stable_id ~ '^[a-z0-9][a-z0-9-]*$'),
  name        text NOT NULL,
  type        text NOT NULL CHECK (type IN ('absolute-claim','restricted-phrase','vague-superlative')),
  description text NOT NULL,
  severity    text NOT NULL CHECK (severity IN ('warning','error')),
  patterns    jsonb NOT NULL CHECK (jsonb_typeof(patterns) = 'array' AND jsonb_array_length(patterns) BETWEEN 1 AND 50),
  suggestion  text NOT NULL DEFAULT '',
  enabled     boolean NOT NULL DEFAULT true,
  version     integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, stable_id)
);

CREATE TABLE review_runs (
  id                   text PRIMARY KEY,
  org_id               text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  brand_id             text NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  brand_name           text NOT NULL,
  brand_is_demo        boolean NOT NULL,
  created_by           text NOT NULL REFERENCES users(id),
  rule_snapshot        jsonb NOT NULL,
  content_fingerprint  char(64) NOT NULL,
  content_length       integer NOT NULL CHECK (content_length BETWEEN 1 AND 10000),
  content              text,             -- NULL unless content retention is explicitly enabled
  finding_total        integer NOT NULL,
  finding_errors       integer NOT NULL,
  finding_warnings     integer NOT NULL,
  outcome              text NOT NULL CHECK (outcome IN ('no_rules_triggered','findings_require_review')),
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX review_runs_org_created_idx ON review_runs (org_id, created_at DESC, id DESC);

CREATE TABLE review_findings (
  id               text NOT NULL,
  review_run_id    text NOT NULL REFERENCES review_runs(id) ON DELETE CASCADE,
  rule_stable_id   text NOT NULL,
  rule_version     integer NOT NULL,
  rule_type        text NOT NULL,
  severity         text NOT NULL CHECK (severity IN ('warning','error')),
  matched_phrase   text NOT NULL,
  start_offset     integer NOT NULL,
  end_offset       integer NOT NULL,
  explanation      text NOT NULL,
  suggestion       text NOT NULL,
  PRIMARY KEY (review_run_id, id)
);

COMMIT;
