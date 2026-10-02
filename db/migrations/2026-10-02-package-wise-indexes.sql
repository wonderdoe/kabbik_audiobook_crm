-- Package-wise day query indexes — review EXPLAIN on staging before applying.
-- Apply one statement at a time if online DDL is sensitive.

ALTER TABLE bkash_onetime
  ADD INDEX idx_bkash_onetime_status_created (executeStatusMessage, created_at);

ALTER TABLE bkash_webhook
  ADD INDEX idx_bkash_webhook_status_trx (paymentStatus, trxDate);

ALTER TABLE robi_payment
  ADD INDEX idx_robi_status_created (status, created_at);

ALTER TABLE nagad_payment
  ADD INDEX idx_nagad_status_created (status, created_at);

ALTER TABLE upay_payment
  ADD INDEX idx_upay_status_created (status, created_at);

ALTER TABLE aamarPay
  ADD INDEX idx_aamarpay_sub_status_created (payment_type, ststus, created_at);

ALTER TABLE stripe_payment
  ADD INDEX idx_stripe_succeed_created (is_succeed, created_at);

ALTER TABLE stripe_webhook
  ADD INDEX idx_stripe_wh_created (created_at);

ALTER TABLE googlepay_invoice
  ADD INDEX idx_gpay_status_created (status, created_at);

ALTER TABLE apple_pay
  ADD INDEX idx_apple_status_created (status, created_at);
