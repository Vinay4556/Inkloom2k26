-- DESTRUCTIVE. Drops all Inkloom tables. Run only against a database you intend to wipe.
BEGIN;
DROP TABLE IF EXISTS review_findings, review_runs, brand_rules, brands, memberships, users, organizations;
COMMIT;
