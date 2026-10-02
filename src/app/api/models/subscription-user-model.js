import DB from '../../../server/config/db.js';
import {
	fetchActiveSubscribers,
	queryRentCountVariant,
} from '../../../server/jobs/user-report-queries.js';

class SubscriptionUserModel {
	tableName = 'users';
	userlist = async (offset, limit) => {
		try {
			const sql = `SELECT id, full_name, user_name, user_email, phone_no, created_at, is_subscribed
			FROM users
			ORDER BY id DESC
			LIMIT ${limit} OFFSET ${offset}`;

			const result = await DB.query(sql);

			const sql2 = `SELECT
				COUNT(*) AS total_count,
				SUM(CASE WHEN is_subscribed = 1 THEN 1 ELSE 0 END) AS subscribed_count
			FROM users`;

			const result2 = await DB.query(sql2);
			const response = {
				result,
				totalUser: result2[0],
			};
			return response;
		} catch (error) {
			console.log(error);
		}
	};

	searchUser = async (searchkey, offset, limit) => {
		try {
			const trimmed = String(searchkey ?? '').trim();
			const isNumericId = /^\d+$/.test(trimmed);
			const idClause = isNumericId ? 'OR id = ?' : '';
			const query = `
				SELECT * FROM users
				WHERE (
					LOWER(user_name) LIKE CONCAT('%', LOWER(?), '%')
					OR LOWER(full_name) LIKE CONCAT('%', LOWER(?), '%')
					OR LOWER(user_email) LIKE CONCAT('%', LOWER(?), '%')
					OR LOWER(phone_no) LIKE CONCAT('%', LOWER(?), '%')
					${idClause}
				)
				LIMIT ${limit} OFFSET ${offset}
			`;
			// const pageCountSql =
			// 	"SELECT COUNT(*) AS total_count FROM users WHERE user_name LIKE CONCAT('%', ? ,'%') OR full_name LIKE CONCAT('%', ? ,'%') OR user_email LIKE CONCAT('%', ? ,'%') OR phone_no LIKE CONCAT('%', ? ,'%');";
			const params = [trimmed, trimmed, trimmed, trimmed];
			if (isNumericId) {
				params.push(parseInt(trimmed, 10));
			}
			const result = await DB.query(query, params);

			// const result2 = await DB.query(pageCountSql, [search, search, search, search]);
			// const pageCount = result2[0];

			return result;
		} catch (error) {
			throw new Error(error);
		}
	};

	searchManuallySubscribedUser = async (offset, limit, searchkey) => {
		try {
			const query = `
				SELECT * FROM manual_subscriptions
				WHERE LOWER(transaction_id) LIKE CONCAT('%', LOWER(?), '%')
				OR LOWER(subscription_id) LIKE CONCAT('%', LOWER(?), '%')
				LIMIT ${limit} OFFSET ${offset}
			`;
			const result = await DB.query(query, [searchkey, searchkey]);
			return result;
		} catch (error) {
			throw new Error(error);
		}
	};

	getPaymentLogByPayerNo = async payerNo => {
		try {
			const trimmed = String(payerNo ?? '').trim();
			if (!trimmed) {
				return [];
			}
			const sql = `
				SELECT uspl.*, sp.name
				FROM user_subscription_payment_log AS uspl
				LEFT JOIN subscription_packages AS sp ON sp.subscriptionItemId = uspl.package_id
				WHERE uspl.payer = ?
					OR uspl.payer LIKE CONCAT('%', ?, '%')
					OR uspl.user_id IN (
						SELECT id FROM users
						WHERE phone_no = ? OR phone_no LIKE CONCAT('%', ?, '%')
					)
				ORDER BY uspl.created_at DESC;
			`;
			return await DB.query(sql, [trimmed, trimmed, trimmed, trimmed]);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	detailsList = async id => {
		try {
			const sql = `
				SELECT uspl.*,sp.name FROM user_subscription_payment_log AS uspl 
				left join subscription_packages as sp on sp.subscriptionItemId=uspl.package_id
				where uspl.user_id = ?
				order by uspl.created_at desc;
			`
			// const sql = `
			// 	SELECT *
			// 	FROM users
			// 	LEFT JOIN bkash_invoice ON users.id = bkash_invoice.userId
			// 	LEFT JOIN bkash_webhook wh ON bkash_invoice.subscriptionRequestId = wh.subscriptionRequestId
			// 	WHERE users.id = ? order by wh.created_at desc
			// `;
			const result = await DB.query(sql, [id]);
			return result;
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	getSubcribedUser = async _date => {
		try {
			return await fetchActiveSubscribers(0);
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	getPlayCount = async () => {
		try {
			const sql = `SELECT sum(mybl_play_count) as my_playcount FROM audiobooks where mybl_play_count <> 0`;

			const sql2 = `SELECT SUM(play_count) AS play_count FROM audiobooks where play_count <> 0`;

			const sqlResponse = await DB.query(sql);
			const sqlResponse2 = await DB.query(sql2);

			const results = [
				{
					title: 'MyBl Play Count',
					count: sqlResponse[0].my_playcount || 0,
					image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png',
				},
				{
					title: 'Kabbik Play Count',
					count: sqlResponse2[0].play_count || 0,
					image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png',
				},
			];

			return results;
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	getPlayCountReport = async () => {
		try {
			const result = [];

			for (let i = 0; i < 8; i++) {
				const currentDate = new Date();
				currentDate.setDate(currentDate.getDate() - i);
				const formattedDate = currentDate.toISOString().slice(0, 10);

				const sql = `SELECT COUNT(id) AS kabbik_playcount FROM audiobook_play_count_log WHERE DATE(created_at) = '${formattedDate}'`;
				const sql2 = `SELECT COUNT(DISTINCT user_id) AS kabbik_uniquecount FROM audiobook_play_count_log WHERE DATE(created_at) = '${formattedDate}'`;
				const sql3 = `SELECT COUNT(id) AS mybl_playcount FROM audiobook_play_count_log_mybl WHERE DATE(created_at) = '${formattedDate}'`;
				const sql4 = `SELECT COUNT(DISTINCT user_id) AS mybl_uniquecount FROM audiobook_play_count_log_mybl WHERE DATE(created_at) = '${formattedDate}'`;
				const [sqlResponse, sqlResponse2, sqlResponse3, sqlResponse4] = await Promise.all([
					DB.query(sql),
					DB.query(sql2),
					DB.query(sql3),
					DB.query(sql4),
				]);

				result.push({
					date: formattedDate,
					kabbik_playcount: sqlResponse[0].kabbik_playcount,
					kabbik_uniquecount: sqlResponse2[0].kabbik_uniquecount,
					mybl_playcount: sqlResponse3[0].mybl_playcount,
					mybl_uniquecount: sqlResponse4[0].mybl_uniquecount,
				});
			}
			return result;
		} catch (error) {
			console.error('Error executing SQL query:', error);
			throw error; // Rethrow the error for further handling
		}
	};

	getManuallySubscribedUsers = async (offset, limit) => {
		try {
			const query = `
				SELECT *
				FROM manual_subscriptions
				ORDER BY id DESC
				LIMIT ${offset}, ${limit};
			`;
			const totalCountQuery = `SELECT COUNT(*) AS total_manual_subscription FROM manual_subscriptions`;
			const response = await DB.query(query);
			const totalCountResult = await DB.query(totalCountQuery);
			return { response, totalCount: totalCountResult };
		} catch (error) {
			console.log(error);
		}
	};

	giveSubscriptionToUser = async body => {
		try {
			console.log("i am here")
			const {
				userId,
				packageId,
				paymentMethod,
				subscriptionDate,
				transactionId,
				subscriptionId,
				promocode,
				proofOfPayment,
				modifiedBy,
			} = body;

			let packageSql=`SELECT days FROM subscription_packages WHERE subscriptionItemId=?;`;
			const getSubsCriptionData= await  DB.query(packageSql, [packageId]);
			console.log(getSubsCriptionData)

			const query1 = `
				UPDATE users
				SET package_id = ${packageId},
					is_subscribed = 1,
					payment_method = ?,
					subscription_id = ?,
					purchase_time = CONVERT_TZ('${subscriptionDate}', '+00:00', '+06:00'),
					next_purchase_time = DATE_ADD(CONVERT_TZ('${subscriptionDate}', '+00:00', '+06:00'), INTERVAL ${getSubsCriptionData[0]?.days} DAY)
				WHERE id = ?
			`;
			console.log(query1)
			const query2 = `
				INSERT INTO manual_subscriptions(user_id, package_id, payment_method, subscription_date, transaction_id, subscription_id, promocode, payment_proof, modified_by)
				VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);
			`;
			const response1 = await DB.query(query1, [paymentMethod, subscriptionId, userId]);
			if (response1.changedRows === 1) {
				const response2 = await DB.query(query2, [
					userId,
					packageId,
					paymentMethod,
					subscriptionDate,
					transactionId,
					subscriptionId,
					promocode,
					proofOfPayment,
					modifiedBy,
				]);
				return { response1, response2 };
			}
			return { response1 };
		} catch (error) {
			console.log(error);
		}
	};

	getRentCount = async body => {
		const { isActive, isUnique } = body;
		try {
			return await queryRentCountVariant({ isActive, isUnique });
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	
}
export default new SubscriptionUserModel();


