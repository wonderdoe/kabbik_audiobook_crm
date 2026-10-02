-- Daywise promo UNION branches — review EXPLAIN on staging before applying.
-- Apply one statement at a time if online DDL is sensitive.

ALTER TABLE bkash_onetime
  ADD INDEX idx_bkash_onetime_promo_created (promo_code, created_at);

ALTER TABLE bkash_invoice
  ADD INDEX idx_bkash_invoice_promo_created (promoCode, created_at);

ALTER TABLE nagad_payment
  ADD INDEX idx_nagad_promo_status_created (promo_code, status, created_at);

ALTER TABLE upay_payment
  ADD INDEX idx_upay_code_status_created (code, status, created_at);

ALTER TABLE robi_payment
  ADD INDEX idx_robi_promo_status_created (promo_code, status, created_at);
