import DB from '../config/db.js';

/** Dhaka calendar day filter for a column expression (UTC storage). */
const dhakaDayEq = expr => `DATE(CONVERT_TZ(${expr}, 'UTC', '+06:00')) = ?`;

/**
 * Per-package amount rows for a single Dhaka day (before subscription_packages join).
 * @returns {Promise<Array<{ package_id: string|number, raw_total: number }>>}
 */
export async function queryPackageWiseDay(day) {
	const sql = `
		SELECT package_id, SUM(amount) AS raw_total
		FROM (
			SELECT ROUND(amount) AS amount, packageId AS package_id
			FROM bkash_onetime b1
			WHERE ${dhakaDayEq('created_at')}
				AND executeStatusMessage = 'Successful'
				AND amount IS NOT NULL

			UNION ALL

			SELECT ROUND(bw.amount) AS amount, bi.package_id
			FROM bkash_webhook bw
			JOIN bkash_invoice bi ON bw.subscriptionRequestId = bi.subscriptionRequestId
			WHERE ${dhakaDayEq('bw.trxDate')}
				AND bw.paymentStatus = 'SUCCEEDED_PAYMENT'

			UNION ALL

			SELECT ROUND(amount) AS amount, packageId AS package_id
			FROM robi_payment r1
			WHERE ${dhakaDayEq('created_at')}
				AND status = 'SUCCEEDED'
				AND amount <> ''
				AND amount IS NOT NULL

			UNION ALL

			SELECT ROUND(amount) AS amount, packageId AS package_id
			FROM nagad_payment n1
			WHERE ${dhakaDayEq('created_at')}
				AND status = 'Success'
				AND amount IS NOT NULL
				AND amount >= 0

			UNION ALL

			SELECT ROUND(amount) AS amount, packageId AS package_id
			FROM upay_payment u1
			WHERE ${dhakaDayEq('created_at')}
				AND status = 'success'
				AND amount <> ''
				AND amount IS NOT NULL

			UNION ALL

			SELECT ROUND(amount) AS amount, REPLACE(JSON_EXTRACT(body_response, '$.opt_c'), '"', '') AS package_id
			FROM aamarPay a1
			WHERE ${dhakaDayEq('created_at')}
				AND payment_type = 'subscription'
				AND ststus = 'Successful'

			UNION ALL

			SELECT
				COALESCE(ROUND(SUM((CASE
					WHEN product_id = 1 THEN 0.99
					WHEN product_id = 2 THEN 4.99
					WHEN product_id = 3 THEN 9.99
				END) * 121.14)), 0) AS amount,
				product_id AS package_id
			FROM stripe_payment s1
			WHERE ${dhakaDayEq('created_at')}
				AND is_succeed = 1
			GROUP BY product_id

			UNION ALL

			SELECT
				ROUND(CASE sp.product_id
					WHEN 1 THEN 0.99
					WHEN 2 THEN 4.99
					WHEN 3 THEN 9.99
				END * 121.14) AS amount,
				product_id AS package_id
			FROM stripe_webhook sw
			JOIN stripe_payment sp ON sw.customer_id = sp.customer_id
			WHERE ${dhakaDayEq('sw.created_at')}
				AND sw.cancel_at IS NULL

			UNION ALL

			SELECT
				COALESCE(ROUND((CASE
					WHEN gp.packageId = 1 THEN 0.99
					WHEN gp.packageId = 2 THEN 4.99
					WHEN gp.packageId = 3 THEN 9.99
				END) * 121.14), 0) AS amount,
				gp.packageId AS package_id
			FROM googlepay_invoice gp
			JOIN revenuecat_webhook rw ON gp.userId = rw.app_user_id
			WHERE ${dhakaDayEq('gp.created_at')}
				AND gp.status = 'Success'

			UNION ALL

			SELECT
				COALESCE(ROUND((CASE
					WHEN ap.packageId = 1 OR ap.packageId = 'kabbik_99' THEN 0.99
					WHEN ap.packageId = 2 OR ap.packageId = 'kabbik_499_6m' THEN 4.99
					WHEN ap.packageId = 3 OR ap.packageId = 'kabbik_999_1y' THEN 9.99
				END) * 121.14), 0) AS amount,
				ap.packageId AS package_id
			FROM apple_pay ap
			LEFT JOIN revenuecat_webhook rw ON ap.userId = rw.app_user_id
			WHERE ${dhakaDayEq('ap.created_at')}
				AND ap.status = 'Success'
		) combined
		GROUP BY package_id
	`;
	const dayParams = Array(10).fill(day);
	const rows = await DB.query(sql, dayParams);
	return rows.map(r => ({
		package_id: String(r.package_id),
		raw_total: Number(r.raw_total) || 0,
	}));
}
