CREATE TABLE IF NOT EXISTS app_maintenance_status_log (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  platform              ENUM('app','website') NOT NULL,
  is_under_maintenance  TINYINT(1) NOT NULL,
  title_en              VARCHAR(150) NULL,
  title_bn              VARCHAR(150) NULL,
  message_en            VARCHAR(500) NULL,
  message_bn            VARCHAR(500) NULL,
  starts_at             DATETIME NULL,
  ends_at               DATETIME NULL,
  changed_by            VARCHAR(100) NOT NULL,
  changed_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_platform_changed (platform, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
