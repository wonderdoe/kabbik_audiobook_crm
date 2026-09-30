-- Quick Access menu shortcuts for Kabbik mobile app (admin-managed in CRM)
-- Apply: mysql ... kabbik < db/migrations/2026-09-30-quick-access.sql

CREATE TABLE IF NOT EXISTS quick_access (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  en_name     VARCHAR(100)    NOT NULL,
  bn_name     VARCHAR(100)    NOT NULL,
  goto_page   VARCHAR(150)    NOT NULL,
  audience    ENUM('all','free','premium') NOT NULL DEFAULT 'all',
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  sort_order  INT             NOT NULL DEFAULT 0,
  created_by  BIGINT UNSIGNED NULL,
  updated_by  BIGINT UNSIGNED NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_qa_active_audience_sort (is_active, audience, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Run once: seed default shortcuts (skip if rows already exist)
INSERT INTO quick_access (en_name, bn_name, goto_page, audience, is_active, sort_order)
SELECT * FROM (
  SELECT 'Rent' AS en_name, 'রেন্ট' AS bn_name, '/rent' AS goto_page, 'all' AS audience, 1 AS is_active, 1 AS sort_order
  UNION ALL SELECT 'Subscription', 'সাবস্ক্রিপশন', '/subscription', 'all', 1, 2
  UNION ALL SELECT 'Upcoming', 'আপকামিং', '/upcoming', 'all', 1, 3
  UNION ALL SELECT 'Refer and Earn', 'রেফার এবং আর্ন', '/refer', 'all', 1, 4
  UNION ALL SELECT 'Rewards', 'রিওয়ার্ডস', '/rewards', 'all', 1, 5
  UNION ALL SELECT 'Book Request', 'বুক রিকোয়েস্ট', '/bookRequest', 'all', 1, 6
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM quick_access LIMIT 1);

/*
  Mobile backend (api.kabbik.com) — active subscriber = premium audience:
    users.is_subscribed = 1
    AND users.canceled_subscription = 0
    AND NOW() <= FROM_UNIXTIME(users.next_purchase_time / 1000)
  Otherwise audience = 'free'.

  SELECT id, en_name, bn_name, goto_page
  FROM quick_access
  WHERE is_active = 1
    AND audience IN ('all', ?)   -- ? = 'free' or 'premium'
  ORDER BY sort_order ASC, id ASC;
*/
