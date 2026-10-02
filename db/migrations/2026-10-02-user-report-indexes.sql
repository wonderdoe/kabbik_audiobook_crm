-- User report query indexes (payment log lifetime/active, rent join).
-- Review EXPLAIN on staging/production before applying.
-- Apply: mysql ... kabbik < db/migrations/2026-10-02-user-report-indexes.sql

ALTER TABLE user_subscription_payment_log
  ADD INDEX idx_uspl_bl_user_created (from_banglalink, user_id, created_at),
  ADD INDEX idx_uspl_lifetime (
    from_banglalink,
    payment_status,
    rent_payment,
    is_subscribed,
    user_id,
    payment_method,
    is_recurring
  );

ALTER TABLE store_log
  ADD INDEX idx_store_rent (purchase_type, is_succeed, user_id, product_id, payment_method);

ALTER TABLE audiobooks_rent
  ADD INDEX idx_rent_user_book_exp (user_id, audiobook_id, expired_at);

-- Optional when USER_REPORT_ACTIVE_SOURCE=users:
-- ALTER TABLE users ADD INDEX idx_users_subscribed (is_subscribed, client_id, payment_method);
