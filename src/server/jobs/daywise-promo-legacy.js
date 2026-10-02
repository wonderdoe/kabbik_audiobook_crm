import DB from '../config/db.js';

/**
 * Original daywise promo query (all-time, one row per user via GROUP BY userId).
 * Used for DAYWISE_PROMO_LEGACY=1 and validation benchmarks.
 */
export async function queryDaywisePromoLegacy(offset, limit) {
	const innerUnion = `
		SELECT userId, source, created_at AS payment_time, amount, promo_code, packageId, 'bkash_onetime' AS payment_mode
		FROM bkash_onetime
		WHERE ((promo_code IS NOT NULL AND promo_code != '' AND executeStatusMessage = 'Successful') OR subscribed = 1)
		AND (source IS NOT NULL OR source != '')
		AND EXISTS ( SELECT 1 FROM promo WHERE bkash_onetime.promo_code = promo.promocode )

		UNION ALL

		SELECT bi.userId, bi.source, bi.created_at AS payment_time, wh.amount, bi.promoCode AS promo_code, bi.package_id AS packageId, 'bkash_recurring' AS payment_mode
		FROM bkash_invoice bi
		JOIN bkash_webhook wh ON bi.subscriptionRequestId = wh.subscriptionRequestId
		WHERE wh.paymentStatus = 'SUCCEEDED_PAYMENT'
			AND bi.promoCode IS NOT NULL AND bi.promoCode != '' AND bi.subscribed = 1 AND (bi.source IS NOT NULL OR bi.source != '')
			AND EXISTS ( SELECT 1 FROM promo WHERE bi.promoCode = promo.promocode )

		UNION ALL

		SELECT userId, from_source AS source, created_at AS payment_time, amount, promo_code, packageId, 'nagad_payment' AS payment_mode
		FROM nagad_payment
		WHERE promo_code IS NOT NULL AND promo_code != '' AND status = 'Success' AND (from_source IS NOT NULL OR from_source != '')
		AND EXISTS ( SELECT 1 FROM promo WHERE nagad_payment.promo_code = promo.promocode )

		UNION ALL

		SELECT userId, from_source AS source, created_at AS payment_time, amount, code AS promo_code, packageId AS packageId, 'upay_payment' AS payment_mode
		FROM upay_payment
		WHERE code IS NOT NULL AND code != '' AND status = 'Success' AND (from_source IS NOT NULL OR from_source != '')
		AND EXISTS ( SELECT 1 FROM promo WHERE upay_payment.code = promo.promocode )

		UNION ALL

		SELECT userId, from_source AS source, created_at AS payment_time, amount, promo_code, packageId, 'robi_payment' AS payment_mode
		FROM robi_payment
		WHERE promo_code IS NOT NULL AND promo_code != '' AND status = 'SUCCEEDED' AND (from_source IS NOT NULL OR from_source != '')
		AND EXISTS ( SELECT 1 FROM promo WHERE robi_payment.promo_code = promo.promocode )
	`;

	const sql = `
		SELECT u.*, p.*
		FROM (
			SELECT userId, source, amount, promo_code, packageId, payment_mode, MAX(payment_time) AS payment_time
			FROM (${innerUnion}) AS all_payments
			GROUP BY userId
		) AS p
		JOIN users AS u ON u.id = p.userId
		ORDER BY payment_time DESC
		LIMIT ? OFFSET ?
	`;

	const sql2 = `
		SELECT COUNT(*) AS total_count
		FROM (
			SELECT userId
			FROM (
				SELECT userId, MAX(payment_time) AS payment_time
				FROM (${innerUnion}) AS all_payments
				GROUP BY userId
			) AS grouped
		) AS p
	`;

	const data = await DB.query(sql, [Number(limit), Number(offset)]);
	const data2 = await DB.query(sql2);
	return {
		data,
		total: data2[0]?.total_count ?? 0,
	};
}
