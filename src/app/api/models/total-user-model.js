import moment from 'moment';
import DB from '../../../server/config/db.js';

class TotalUserModel {
	tableName = 'users';
	getTotal = async date => {
		try {
			const sql = `
				SELECT COUNT(*) AS total_users
				FROM users
				WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+06:00')) <= ?
			`;
			const sql2 = `
				SELECT COUNT(*) AS total_subscribers
				FROM users
				WHERE is_subscribed = 1
					AND canceled_subscription = 0
					AND NOW() <= FROM_UNIXTIME(next_purchase_time / 1000)
					AND DATE(CONVERT_TZ(created_at, '+00:00', '+06:00')) <= ?
			`;
			const sql3 = `
				SELECT SUM(play_count) AS play_count
				FROM audiobooks
				WHERE play_count <> 0 AND DATE(CONVERT_TZ(created_at, '+00:00', '+06:00')) <= ?
			`;
			const sql4 = `
				WITH RECURSIVE date_range AS (
					SELECT DATE(DATE_SUB(STR_TO_DATE(?, '%Y-%m-%d'), INTERVAL 0 DAY)) AS date, 0 AS n
					UNION ALL
					SELECT DATE(DATE_SUB(STR_TO_DATE(?, '%Y-%m-%d'), INTERVAL n + 1 DAY)), n + 1
					FROM date_range
					WHERE n < 6
				)
				SELECT dr.date, COALESCE(COUNT(bw.id), 0) AS Count
				FROM date_range dr
				LEFT JOIN bkash_webhook bw
					ON DATE(CONVERT_TZ(bw.created_at, '+00:00', '+06:00')) = dr.date
					AND bw.firstPayment = 1
					AND bw.paymentStatus = 'SUCCEEDED_PAYMENT'
				GROUP BY dr.date
				ORDER BY dr.date DESC
			`;
			const sql5 = `
				WITH RECURSIVE date_range AS (
					SELECT DATE(DATE_SUB(STR_TO_DATE(?, '%Y-%m-%d'), INTERVAL 0 DAY)) AS date, 0 AS n
					UNION ALL
					SELECT DATE(DATE_SUB(STR_TO_DATE(?, '%Y-%m-%d'), INTERVAL n + 1 DAY)), n + 1
					FROM date_range
					WHERE n < 6
				)
				SELECT dr.date, COALESCE(COUNT(bw.id), 0) AS count
				FROM date_range dr
				LEFT JOIN bkash_webhook bw
					ON DATE(CONVERT_TZ(bw.created_at, '+00:00', '+06:00')) = dr.date
					AND bw.subscriptionStatus = 'CANCELLED'
				GROUP BY dr.date
				ORDER BY dr.date DESC
			`;

			const sqlResponse = await DB.query(sql, [date]);
			const sqlResponse2 = await DB.query(sql2, [date]);
			const sqlResponse3 = await DB.query(sql3, [date]);
			const sqlResponse4 = await DB.query(sql4, [date, date]);
			const sqlResponse5 = await DB.query(sql5, [date, date]);
			const results = [
				{ title: 'Total Users', count: sqlResponse[0]?.total_users || 0 },
				{ title: 'Total Subscribers', count: sqlResponse2[0]?.total_subscribers || 0 },
				{ title: 'Total Play Count', count: sqlResponse3[0]?.play_count || 0 },
				{
					title: 'Bkash New Recurring Subscribers',
					count:
						sqlResponse4.map(item => ({
							...item,
							date: moment(item.date).format('Do MMM, YYYY'),
						})) || [],
				},
				{
					title: "Today's Left Bkash Subscribers",
					count: Number(sqlResponse5[0]?.count ?? 0),
				},
				{
					title: "Yesterday's Left Bkash Subscribers",
					count: Number(sqlResponse5[1]?.count ?? 0),
				},
			];
			return results;
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	getNewUsers = async (startDate, endDate) => {
		try {
			const query = `
				SELECT user_email AS email, full_name AS name FROM users
				WHERE client_id IS NULL
				AND user_email LIKE '%@%'
				AND DATE(created_at) BETWEEN '2024-08-25' AND '2024-08-27'
				LIMIT 300
			`;
			const result = await DB.query(query, [startDate, endDate]);
			return result;
		} catch (err) {
			return err;
		}
	};
}

export default new TotalUserModel();
