-- Phase 3: daily payment rollup for home dashboard
-- Apply: mysql ... kabbik < db/migrations/2026-09-30-daily-payment-stats.sql

CREATE TABLE IF NOT EXISTS daily_payment_stats (
  stat_date DATE NOT NULL PRIMARY KEY,
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  payment_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
