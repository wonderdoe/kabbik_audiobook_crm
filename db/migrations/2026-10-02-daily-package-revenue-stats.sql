-- Package-wise report daily facts
CREATE TABLE IF NOT EXISTS daily_package_revenue_stats (
  stat_date DATE NOT NULL,
  package_id VARCHAR(64) NOT NULL,
  raw_total DECIMAL(18,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (stat_date, package_id),
  KEY idx_pkg_date (package_id, stat_date)
);
