import DB from '../config/db.js';
import {
	mapPaymentSourceRows,
	mapPaymentSourceRow,
	sumMappedCounts,
} from './user-report-payment-mapper.js';

const BL_CLIENT_IDS = ['mybl-client-2024', 'client_id'];

/** @returns {'log' | 'users'} */
export function activeSubscriberSource() {
	const v = (process.env.USER_REPORT_ACTIVE_SOURCE || 'log').toLowerCase();
	return v === 'users' ? 'users' : 'log';
}

/** Legacy ROW_NUMBER query — validation baseline only. */
export async function queryActiveLatestLegacy(fromBanglalink) {
	const requireNotCancelled = fromBanglalink === 0;
	const newQuery = `
		WITH latest_docs AS (
			SELECT *
			FROM (
				SELECT *,
					ROW_NUMBER() OVER (
						PARTITION BY user_id
						ORDER BY created_at DESC, sub_request_id DESC
					) AS rn
				FROM user_subscription_payment_log
				WHERE from_banglalink = ?
			) t
			WHERE rn = 1
		)
		SELECT
			spl.is_recurring,
			spl.payment_method AS payment_source,
			COUNT(DISTINCT CASE WHEN spl.is_subscribed = 1 THEN spl.user_id END) AS count
		FROM latest_docs AS spl
		WHERE payment_status = 'SUCCEEDED_PAYMENT'
			AND from_banglalink = ?
			AND amount != '1'
			AND rent_payment = 0
			${requireNotCancelled ? 'AND isCancelled = 0' : ''}
		GROUP BY spl.payment_method, spl.is_recurring
	`;
	const rows = await DB.query(newQuery, [fromBanglalink, fromBanglalink]);
	return mapPaymentSourceRows(rows);
}

/** Optimized latest-per-user — MAX(created_at) with sub_request_id tie-break (no surrogate id on log). */
export async function queryActiveLatestOptimized(fromBanglalink) {
	const requireNotCancelled = fromBanglalink === 0;
	const newQuery = `
		SELECT
			spl.is_recurring,
			spl.payment_method AS payment_source,
			COUNT(DISTINCT CASE WHEN spl.is_subscribed = 1 THEN spl.user_id END) AS count
		FROM user_subscription_payment_log spl
		INNER JOIN (
			SELECT
				spl2.user_id,
				lc.max_created_at,
				MAX(COALESCE(spl2.sub_request_id, '')) AS max_sub_request_id
			FROM user_subscription_payment_log spl2
			INNER JOIN (
				SELECT user_id, MAX(created_at) AS max_created_at
				FROM user_subscription_payment_log
				WHERE from_banglalink = ?
					AND payment_status = 'SUCCEEDED_PAYMENT'
					AND rent_payment = 0
					AND amount != '1'
				GROUP BY user_id
			) lc ON spl2.user_id = lc.user_id AND spl2.created_at = lc.max_created_at
			WHERE spl2.from_banglalink = ?
				AND spl2.payment_status = 'SUCCEEDED_PAYMENT'
				AND spl2.rent_payment = 0
				AND spl2.amount != '1'
			GROUP BY spl2.user_id, lc.max_created_at
		) latest
			ON spl.user_id = latest.user_id
			AND spl.created_at = latest.max_created_at
			AND COALESCE(spl.sub_request_id, '') = latest.max_sub_request_id
		WHERE spl.payment_status = 'SUCCEEDED_PAYMENT'
			AND spl.from_banglalink = ?
			AND spl.amount != '1'
			AND spl.rent_payment = 0
			${requireNotCancelled ? 'AND spl.isCancelled = 0' : ''}
		GROUP BY spl.payment_method, spl.is_recurring
	`;
	const rows = await DB.query(newQuery, [fromBanglalink, fromBanglalink, fromBanglalink]);
	return mapPaymentSourceRows(rows);
}

/** Users with multiple succeeded log rows sharing the same (user_id, created_at) — inflates old active join. */
export async function countActiveCreatedAtTies(fromBanglalink = 0) {
	const sql = `
		SELECT COUNT(*) AS tie_user_groups
		FROM (
			SELECT user_id, created_at
			FROM user_subscription_payment_log
			WHERE from_banglalink = ?
				AND payment_status = 'SUCCEEDED_PAYMENT'
				AND rent_payment = 0
				AND amount != '1'
			GROUP BY user_id, created_at
			HAVING COUNT(*) > 1
		) ties
	`;
	const rows = await DB.query(sql, [fromBanglalink]);
	return Number(rows[0]?.tie_user_groups ?? 0);
}

/** Path B — active subscribers from users (BL via client_id heuristic). */
export async function queryActiveFromUsers({ banglalink }) {
	const blClause = banglalink
		? `client_id IS NOT NULL AND client_id IN (${BL_CLIENT_IDS.map(() => '?').join(', ')})`
		: `(client_id IS NULL OR client_id NOT IN (${BL_CLIENT_IDS.map(() => '?').join(', ')}))`;
	const params = banglalink ? [...BL_CLIENT_IDS] : [...BL_CLIENT_IDS];
	const sql = `
		SELECT
			payment_source,
			is_recurring,
			COUNT(*) AS count
		FROM (
			SELECT
				u.id,
				COALESCE(u.payment_method, 'unknown') AS payment_source,
				COALESCE(spl.is_recurring, 0) AS is_recurring
			FROM users u
			LEFT JOIN (
				SELECT user_id, MAX(created_at) AS max_created_at
				FROM user_subscription_payment_log
				WHERE payment_status = 'SUCCEEDED_PAYMENT'
				GROUP BY user_id
			) lm ON lm.user_id = u.id
			LEFT JOIN user_subscription_payment_log spl
				ON spl.user_id = lm.user_id AND spl.created_at = lm.max_created_at
			WHERE u.is_subscribed = 1
				AND ${blClause}
		) active_users
		GROUP BY payment_source, is_recurring
	`;
	const rows = await DB.query(sql, params);
	return mapPaymentSourceRows(rows);
}

export async function fetchActiveSubscribers(fromBanglalink) {
	if (activeSubscriberSource() === 'users') {
		return queryActiveFromUsers({ banglalink: fromBanglalink === 1 });
	}
	return queryActiveLatestOptimized(fromBanglalink);
}

export async function queryLifetimeSubscriberCounts() {
	const newQuery = `
		SELECT
			spl.is_recurring,
			spl.payment_method AS payment_source,
			COUNT(DISTINCT user_id) AS count
		FROM user_subscription_payment_log AS spl
		WHERE is_subscribed = 1
			AND payment_status = 'SUCCEEDED_PAYMENT'
			AND from_banglalink = 0
			AND amount != '1'
			AND rent_payment = 0
		GROUP BY spl.payment_method, spl.is_recurring
	`;
	const rows = await DB.query(newQuery);
	return mapPaymentSourceRows(rows);
}

const RENT_ALL_VARIANTS_SQL = `
	SELECT
		payment_method,
		COUNT(*) AS total,
		COUNT(DISTINCT s.user_id) AS unique_total,
		SUM(CASE WHEN a.expired_at > NOW() THEN 1 ELSE 0 END) AS active_total,
		COUNT(DISTINCT CASE WHEN a.expired_at > NOW() THEN s.user_id END) AS active_unique
	FROM store_log s
	INNER JOIN audiobooks_rent a
		ON s.product_id = a.audiobook_id AND a.user_id = s.user_id
	WHERE purchase_type = 'Audiobook'
		AND is_succeed = 1
	GROUP BY payment_method
`;

function rentRowsToVariant(rows, { isActive, isUnique }) {
	return mapPaymentSourceRows(
		rows.map(row => {
			let count;
			if (isActive && isUnique) count = row.active_unique;
			else if (isActive) count = row.active_total;
			else if (isUnique) count = row.unique_total;
			else count = row.total;
			return {
				is_recurring: 0,
				payment_source: row.payment_method,
				count,
			};
		}),
		{ sortRent: true },
	);
}

let rentAllVariantsInFlight = null;

/** @returns {{ total, uniqueTotal, activeTotal, activeUnique }} */
export async function queryRentCountAllVariants() {
	if (rentAllVariantsInFlight) {
		return rentAllVariantsInFlight;
	}
	rentAllVariantsInFlight = (async () => {
		const rows = await DB.query(RENT_ALL_VARIANTS_SQL);
		return {
			total: rentRowsToVariant(rows, { isActive: false, isUnique: false }),
			uniqueTotal: rentRowsToVariant(rows, { isActive: false, isUnique: true }),
			activeTotal: rentRowsToVariant(rows, { isActive: true, isUnique: false }),
			activeUnique: rentRowsToVariant(rows, { isActive: true, isUnique: true }),
		};
	})();
	try {
		return await rentAllVariantsInFlight;
	} finally {
		rentAllVariantsInFlight = null;
	}
}

export async function queryRentCountVariant({ isActive, isUnique }) {
	const all = await queryRentCountAllVariants();
	if (isActive === 'true' && isUnique === 'true') return all.activeUnique;
	if (isActive === 'true') return all.activeTotal;
	if (isUnique === 'true') return all.uniqueTotal;
	return all.total;
}

export async function describeUsersColumns() {
	const rows = await DB.query('SHOW COLUMNS FROM users');
	return rows.map(r => r.Field);
}

export { sumMappedCounts, mapPaymentSourceRow };
