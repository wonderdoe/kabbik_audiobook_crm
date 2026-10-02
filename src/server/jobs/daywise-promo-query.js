import DB from '../config/db.js';
import { dhakaTodayYmd, parseYmd } from '../utils/dhaka-date.js';

const dhakaDayBetween = `DATE(CONVERT_TZ(payment_time, 'UTC', '+06:00')) BETWEEN ? AND ?`;

/** Shared UNION of promo payment events (one row per payment). */
export function promoPaymentsUnionSql() {
	return `
		SELECT bo.userId, bo.source, bo.created_at AS payment_time, bo.amount, bo.promo_code, bo.packageId, 'bkash_onetime' AS payment_mode
		FROM bkash_onetime bo
		INNER JOIN promo pr ON pr.promocode = bo.promo_code
		WHERE ((bo.promo_code IS NOT NULL AND bo.promo_code != '' AND bo.executeStatusMessage = 'Successful') OR bo.subscribed = 1)
			AND (bo.source IS NOT NULL OR bo.source != '')

		UNION ALL

		SELECT bi.userId, bi.source, bi.created_at AS payment_time, wh.amount, bi.promoCode AS promo_code, bi.package_id AS packageId, 'bkash_recurring' AS payment_mode
		FROM bkash_invoice bi
		INNER JOIN promo pr ON pr.promocode = bi.promoCode
		JOIN bkash_webhook wh ON bi.subscriptionRequestId = wh.subscriptionRequestId
		WHERE wh.paymentStatus = 'SUCCEEDED_PAYMENT'
			AND bi.promoCode IS NOT NULL AND bi.promoCode != '' AND bi.subscribed = 1
			AND (bi.source IS NOT NULL OR bi.source != '')

		UNION ALL

		SELECT np.userId, np.from_source AS source, np.created_at AS payment_time, np.amount, np.promo_code, np.packageId, 'nagad_payment' AS payment_mode
		FROM nagad_payment np
		INNER JOIN promo pr ON pr.promocode = np.promo_code
		WHERE np.promo_code IS NOT NULL AND np.promo_code != '' AND np.status = 'Success'
			AND (np.from_source IS NOT NULL OR np.from_source != '')

		UNION ALL

		SELECT up.userId, up.from_source AS source, up.created_at AS payment_time, up.amount, up.code AS promo_code, up.packageId AS packageId, 'upay_payment' AS payment_mode
		FROM upay_payment up
		INNER JOIN promo pr ON pr.promocode = up.code
		WHERE up.code IS NOT NULL AND up.code != '' AND up.status = 'Success'
			AND (up.from_source IS NOT NULL OR up.from_source != '')

		UNION ALL

		SELECT rp.userId, rp.from_source AS source, rp.created_at AS payment_time, rp.amount, rp.promo_code, rp.packageId, 'robi_payment' AS payment_mode
		FROM robi_payment rp
		INNER JOIN promo pr ON pr.promocode = rp.promo_code
		WHERE rp.promo_code IS NOT NULL AND rp.promo_code != '' AND rp.status = 'SUCCEEDED'
			AND (rp.from_source IS NOT NULL OR rp.from_source != '')
	`;
}

function filteredPaymentsSubquery() {
	return `
		SELECT userId, source, payment_time, amount, promo_code, packageId, payment_mode
		FROM (${promoPaymentsUnionSql()}) AS all_payments
		WHERE ${dhakaDayBetween}
	`;
}

export function defaultDaywisePromoRange(anchorYmd) {
	const endDate = anchorYmd && parseYmd(anchorYmd).isValid() ? anchorYmd : dhakaTodayYmd();
	const startDate = parseYmd(endDate).subtract(6, 'days').format('YYYY-MM-DD');
	return { startDate, endDate };
}

export async function countDaywisePromoActivations(startDate, endDate) {
	const sql = `
		SELECT COUNT(*) AS total_count
		FROM (${filteredPaymentsSubquery()}) AS filtered
	`;
	const rows = await DB.query(sql, [startDate, endDate]);
	return rows[0]?.total_count ?? 0;
}

export async function queryDaywisePromoActivations({ startDate, endDate, offset, limit }) {
	const sql = `
		SELECT
			u.id AS id,
			u.full_name,
			u.phone_no,
			u.user_email,
			p.userId,
			p.source,
			p.amount,
			p.promo_code,
			p.packageId,
			p.payment_mode,
			p.payment_time
		FROM (${filteredPaymentsSubquery()}) AS p
		JOIN users u ON u.id = p.userId
		ORDER BY p.payment_time DESC
		LIMIT ? OFFSET ?
	`;
	return DB.query(sql, [startDate, endDate, Number(limit), Number(offset)]);
}

export async function buildDaywisePromoPage({ startDate, endDate, offset, limit }) {
	const [total, data] = await Promise.all([
		countDaywisePromoActivations(startDate, endDate),
		queryDaywisePromoActivations({ startDate, endDate, offset, limit }),
	]);
	return { data, total, startDate, endDate };
}
