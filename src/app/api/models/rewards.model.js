import DB from '../../../server/config/db.js';
import {
	ALLOWED_CLAIM_STATUSES,
	claimStatusToNumericStatus,
	parseUserAdditionalInfo,
} from './rewards-status-map';

export const dynamic = 'force-dynamic';

const SORT_COLS = {
	created_at: 'c.created_at',
	updated_at: 'c.updated_at',
	expire_at: 'c.expire_at',
	usage_point: 'c.usage_point',
};

const USER_SAFE_COLUMNS = `
  u.id AS user_table_id,
  u.user_name,
  u.full_name,
  u.user_email,
  u.phone_no,
  u.city,
  u.premium,
  u.is_subscribed,
  u.deleted AS user_deleted,
  u.created_at AS user_created_at
`;

const CURRENT_TIER_JOIN = `
  LEFT JOIN tier_user_current_tier t ON t.id = (
    SELECT t2.id FROM tier_user_current_tier t2
    WHERE t2.user_id = c.user_id
    ORDER BY t2.id DESC
    LIMIT 1
  )
`;

// tier_reward display columns: title, offer_title (no `name` column)
const TIER_REWARD_JOINS = `
  LEFT JOIN tier tr ON tr.id = c.tier_id
  LEFT JOIN tier_reward rw ON rw.id = c.reward_id
`;

function buildWhere(params) {
	const conditions = ['1=1'];
	const values = [];

	if (params.search) {
		const term = params.search.trim();
		if (term) {
			conditions.push(`(
        LOWER(u.full_name) LIKE CONCAT('%', LOWER(?), '%')
        OR LOWER(u.user_name) LIKE CONCAT('%', LOWER(?), '%')
        OR LOWER(u.user_email) LIKE CONCAT('%', LOWER(?), '%')
        OR LOWER(u.phone_no) LIKE CONCAT('%', LOWER(?), '%')
      )`);
			values.push(term, term, term, term);
		}
	}

	if (params.claimStatus) {
		conditions.push('c.claim_status = ?');
		values.push(params.claimStatus);
	}

	if (params.tierId) {
		conditions.push('c.tier_id = ?');
		values.push(Number(params.tierId));
	}

	if (params.isUsed !== undefined && params.isUsed !== null && params.isUsed !== '') {
		conditions.push('c.is_used = ?');
		values.push(Number(params.isUsed));
	}

	if (params.dateFrom) {
		conditions.push('c.created_at >= ?');
		values.push(params.dateFrom);
	}

	if (params.dateTo) {
		conditions.push('c.created_at < ?');
		values.push(params.dateTo);
	}

	return { whereSql: conditions.join(' AND '), values };
}

function serializeRow(row) {
	if (!row) return row;
	const parsed = parseUserAdditionalInfo(row.user_additional_info);
	return {
		...row,
		user_additional_info: parsed,
		created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
		updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
		expire_at: row.expire_at ? new Date(row.expire_at).toISOString() : null,
		user_created_at: row.user_created_at
			? new Date(row.user_created_at).toISOString()
			: null,
	};
}

class RewardsModel {
	getRewardClaims = async (params = {}) => {
		const page = Math.max(1, Number(params.page) || 1);
		const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 25));
		const offset = (page - 1) * pageSize;
		const sortKey = SORT_COLS[params.sort] ? params.sort : 'created_at';
		const order = params.order === 'asc' ? 'ASC' : 'DESC';
		const sortCol = SORT_COLS[sortKey];

		const { whereSql, values } = buildWhere(params);
		const fromClause = `
      FROM tier_user_reward_claim_log c
      LEFT JOIN users u ON u.id = c.user_id
      ${CURRENT_TIER_JOIN}
      ${TIER_REWARD_JOINS}
      WHERE ${whereSql}
    `;

		const selectSql = `
      SELECT
        c.id, c.user_id, c.tier_id, c.reward_id, c.is_used, c.offer,
        c.user_additional_info, c.usage_point, c.status, c.claim_status,
        c.expire_at, c.created_at, c.updated_at,
        ${USER_SAFE_COLUMNS},
        t.tier_id AS current_tier_id, t.acquired_point, t.balance_point,
        tr.name AS tier_name,
        COALESCE(rw.title, rw.offer_title) AS reward_name
      ${fromClause}
      ORDER BY ${sortCol} ${order}
      LIMIT ? OFFSET ?
    `;

		const countSql = `SELECT COUNT(*) AS total ${fromClause}`;

		const [rows, countRows] = await Promise.all([
			DB.query(selectSql, [...values, pageSize, offset]),
			DB.query(countSql, values),
		]);

		return {
			data: rows.map(serializeRow),
			page,
			pageSize,
			total: countRows[0]?.total ?? 0,
		};
	};

	getRewardSummary = async (params = {}) => {
		const { whereSql, values } = buildWhere(params);
		const needsUserJoin = Boolean(params.search?.trim());
		const userJoin = needsUserJoin ? 'LEFT JOIN users u ON u.id = c.user_id' : '';
		const sql = `
      SELECT
        COUNT(*) AS total_claims,
        SUM(CASE WHEN c.claim_status = 'CLAIMED' THEN 1 ELSE 0 END) AS claimed,
        SUM(CASE WHEN c.claim_status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN c.is_used = 1 THEN 1 ELSE 0 END) AS used,
        SUM(CASE WHEN c.expire_at < NOW() AND (c.is_used = 0 OR c.is_used IS NULL) THEN 1 ELSE 0 END) AS expired,
        COUNT(DISTINCT c.user_id) AS unique_users,
        COALESCE(SUM(c.usage_point), 0) AS total_points
      FROM tier_user_reward_claim_log c
      ${userJoin}
      WHERE ${whereSql}
    `;
		const [row] = await DB.query(sql, values);
		return row;
	};

	getRewardClaimById = async id => {
		const sql = `
      SELECT
        c.id, c.user_id, c.tier_id, c.reward_id, c.is_used, c.offer,
        c.user_additional_info, c.usage_point, c.status, c.claim_status,
        c.expire_at, c.created_at, c.updated_at,
        ${USER_SAFE_COLUMNS},
        t.tier_id AS current_tier_id, t.acquired_point, t.balance_point,
        tr.name AS tier_name,
        COALESCE(rw.title, rw.offer_title) AS reward_name
      FROM tier_user_reward_claim_log c
      LEFT JOIN users u ON u.id = c.user_id
      ${CURRENT_TIER_JOIN}
      ${TIER_REWARD_JOINS}
      WHERE c.id = ?
      LIMIT 1
    `;
		const rows = await DB.query(sql, [id]);
		if (!rows.length) return null;

		const claim = serializeRow(rows[0]);
		const otherSql = `
      SELECT
        c.id, c.tier_id, c.reward_id, c.is_used, c.offer, c.usage_point,
        c.status, c.claim_status, c.expire_at, c.created_at,
        tr.name AS tier_name,
        COALESCE(rw.title, rw.offer_title) AS reward_name
      FROM tier_user_reward_claim_log c
      LEFT JOIN tier tr ON tr.id = c.tier_id
      LEFT JOIN tier_reward rw ON rw.id = c.reward_id
      WHERE c.user_id = ? AND c.id != ?
      ORDER BY c.created_at DESC
      LIMIT 20
    `;
		const otherClaims = await DB.query(otherSql, [claim.user_id, id]);
		return {
			claim,
			otherClaims: otherClaims.map(r => ({
				...r,
				created_at: r.created_at ? new Date(r.created_at).toISOString() : null,
				expire_at: r.expire_at ? new Date(r.expire_at).toISOString() : null,
			})),
		};
	};

	getFilterOptions = async () => {
		const [claimStatuses, tiers] = await Promise.all([
			DB.query(
				`SELECT DISTINCT claim_status AS value FROM tier_user_reward_claim_log WHERE claim_status IS NOT NULL ORDER BY claim_status`,
			),
			DB.query(`SELECT id AS value, name AS label FROM tier ORDER BY name`),
		]);

		return {
			claimStatuses: claimStatuses.map(r => String(r.value)),
			tiers: tiers.map(r => ({ value: String(r.value), label: r.label || `Tier ${r.value}` })),
		};
	};

	updateClaimStatus = async (id, claimStatus) => {
		if (!ALLOWED_CLAIM_STATUSES.includes(claimStatus)) {
			throw new Error('Invalid claim status');
		}
		const status = claimStatusToNumericStatus(claimStatus);
		const sql = `
      UPDATE tier_user_reward_claim_log
      SET claim_status = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
		const result = await DB.query(sql, [claimStatus, status, id]);
		if (!result?.affectedRows) {
			return null;
		}
		return this.getRewardClaimById(id);
	};
}

export default new RewardsModel();
