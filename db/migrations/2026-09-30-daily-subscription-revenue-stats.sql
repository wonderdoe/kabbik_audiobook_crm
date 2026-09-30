-- Subscription revenue report daily facts
CREATE TABLE IF NOT EXISTS daily_subscription_revenue_stats (
  stat_date DATE NOT NULL,
  segment ENUM('kabbik','mybl','course') NOT NULL,
  payment_method VARCHAR(32) NOT NULL,
  is_recurring TINYINT NOT NULL DEFAULT 0,
  rent_payment TINYINT NOT NULL DEFAULT 0,
  raw_total DECIMAL(18,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (stat_date, segment, payment_method, is_recurring, rent_payment),
  KEY idx_segment_date (segment, stat_date)
);
