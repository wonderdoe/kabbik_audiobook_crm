-- Payment gateway wise report daily facts
CREATE TABLE IF NOT EXISTS daily_pgw_revenue_stats (
  stat_date DATE NOT NULL,
  payment_method VARCHAR(32) NOT NULL,
  is_recurring TINYINT NOT NULL DEFAULT 0,
  raw_total DECIMAL(18,2) NOT NULL DEFAULT 0,
  new_subscribers INT NOT NULL DEFAULT 0,
  old_subscribers INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (stat_date, payment_method, is_recurring),
  KEY idx_pgw_date (stat_date)
);
