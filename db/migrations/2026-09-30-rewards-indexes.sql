-- Phase 1.4: rewards list/filter/sort indexes
-- Review EXPLAIN on staging/production before applying.
-- Apply: mysql ... kabbik < db/migrations/2026-09-30-rewards-indexes.sql

ALTER TABLE tier_user_reward_claim_log
  ADD INDEX idx_claim_created (created_at),
  ADD INDEX idx_claim_status_created (claim_status, created_at),
  ADD INDEX idx_claim_user (user_id);
