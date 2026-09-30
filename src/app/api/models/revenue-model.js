import moment from 'moment';
import DB from '../../../server/config/db';
import {addDays} from "../helpers/commonFunction"
import { calculatePercentage } from '@/helper/Commonfunction';
import {
	assemblePgwRevenueReport,
	assembleSubscriptionRevenueReport,
} from '../../../server/jobs/revenue-daily-facts.js';

export const dynamic = 'force-dynamic';
class RevenueModel {
	getReport = async (startDate, endDate) => {
		try {
			return await assemblePgwRevenueReport(startDate, endDate);
		} catch (error) {
			console.log(error);
			throw error;
		}
	};


	getRentReport = async (startDate, endDate, day, limit, offset) => {
		const processDate = new Date(endDate);

		processDate.setHours(23);
		processDate.setMinutes(59);
		processDate.setSeconds(59);

		try {
			let sql, result;
			if (startDate && endDate) { 
				const listQuery = `
					SELECT * from(
					SELECT sl.id,sl.user_id,sl.name,sl.email,sl.phone,sl.transaction_status,
	sl.store_item,sl.source,sl.amount,sl.product_id,sl.purchase_type,sl.payment_method , ab.name AS audiobook_name, ab.thumb_path, DATE(CONVERT_TZ(sl.created_at, '+00:00', '+06:00')) AS created_at
					FROM store_log AS sl
					JOIN audiobooks AS ab
					ON sl.product_id = ab.id
					WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND sl.purchase_type = 'Audiobook'
					AND DATE(CONVERT_TZ(sl.created_at, '+00:00', '+06:00')) BETWEEN ? AND ?
					
					union all 
					SELECT sl.id,sl.user_id,sl.name,sl.email,sl.phone,sl.transaction_status,
	sl.store_item,sl.source,sl.amount,sl.product_id,sl.purchase_type,sl.payment_method , c.name AS audiobook_name, c.thumb_path, DATE(CONVERT_TZ(sl.created_at, '+00:00', '+06:00')) AS created_at
					FROM store_log AS sl
					JOIN categories AS c
					ON sl.product_id = c.id
					WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND 
					sl.purchase_type = 'category'
					AND DATE(CONVERT_TZ(sl.created_at, '+00:00', '+06:00')) BETWEEN ? AND ?
				) as combined 
					ORDER BY combined.created_at DESC
					LIMIT ? OFFSET ?
				`;
				const listResult = await DB.query(listQuery, [
					startDate,
					endDate,
					startDate,
					endDate,
					Number(limit),
					Number(offset),
				]);
				// const totalQuery = `
				// 	SELECT SUM(amount) AS total
				// 	FROM store_log AS sl
				// 	JOIN audiobooks AS ab
				// 	ON sl.product_id = ab.id
				// 	WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND (sl.purchase_type = 'Audiobook' OR sl.purchase_type = 'category')
				// `;

				const totalQuery = `
					SELECT SUM(amount) AS total
					FROM store_log AS sl
					WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND (sl.purchase_type = 'Audiobook' OR sl.purchase_type = 'category')
				`;
				const totalResult = await DB.query(totalQuery);
				// const totalInRangeQuery = `
				// 	SELECT SUM(amount) AS totalAmount, COUNT(*) AS totalCount
				// 	FROM store_log AS sl
				// 	JOIN audiobooks AS ab
				// 	ON sl.product_id = ab.id
				// 	WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND (sl.purchase_type = 'Audiobook' OR sl.purchase_type = 'category')
				// 	AND DATE(sl.created_at) BETWEEN ? AND ?
				// `;

				const totalInRangeQuery = `
					SELECT SUM(amount) AS totalAmount, COUNT(*) AS totalCount
					FROM store_log AS sl
					WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND (sl.purchase_type = 'Audiobook' OR sl.purchase_type = 'category')
					AND DATE(CONVERT_TZ(sl.created_at, '+00:00', '+06:00'))  BETWEEN ? AND ?
				`;
				const totalInRangeResult = await DB.query(totalInRangeQuery, [startDate, endDate]);
				result = {
					success: true,
					data: listResult,
					total: totalResult[0].total,
					totalAmountInRange: totalInRangeResult[0].totalAmount,
					totalCountInRange: totalInRangeResult[0].totalCount,
				};
			} else {
				// sql = `
				// 	SELECT sl.*, ab.name AS audiobook_name, ab.thumb_path
				// 	FROM store_log AS sl
				// 	JOIN audiobooks AS ab
				// 	ON sl.product_id = ab.id
				// 	WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND (sl.purchase_type = 'Audiobook' OR sl.purchase_type = 'category')
				// 	AND DATE(sl.created_at) = ?
				// 	ORDER BY DATE(sl.created_at) DESC
				// `;

				sql =`
					SELECT * from(
					SELECT sl.*, ab.name AS audiobook_name, ab.thumb_path
					FROM store_log AS sl
					JOIN audiobooks AS ab
					ON sl.product_id = ab.id
					WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND sl.purchase_type = 'Audiobook'
					
					union all 
					SELECT sl.*, c.name AS audiobook_name, c.thumb_path
					FROM store_log AS sl
					JOIN categories AS c
					ON sl.product_id = c.id
					WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND 
					sl.purchase_type = 'category'
				) as combined 
					ORDER BY combined.created_at DESC
					LIMIT ? OFFSET ?
				`;
				const totalRentRevenueQuery = `
					SELECT SUM(amount) AS total_rent_revenue
					FROM store_log AS sl
					WHERE sl.is_succeed = 1 AND sl.platform = 'Kabbik' AND (sl.purchase_type = 'Audiobook' OR sl.purchase_type = 'category')
				`;
				const response = await DB.query(sql, [day]);
				const totalRentRevenueResult = await DB.query(totalRentRevenueQuery);
				result = {
					success: true,
					data: { response, total: totalRentRevenueResult[0].total_rent_revenue },
				};
			}
			return result;
		} catch (error) {
			console.log(error);
		}
	};

	getRevenueReport = async (startDate, endDate) => {
		try {
			return await assembleSubscriptionRevenueReport(startDate, endDate);
		} catch (error) {
			console.log(error);
			throw error;
		}
	};


	individualPaymentGateway = async item => {
		try {
			const sqlmybl1 = `
        SELECT SUM(amount) AS bkash
        FROM bkash_onetime
        WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = ?
					AND trafficSource = 'Banglalink'
					AND (executeStatusMessage = 'Successful' OR subscribed = 1)
					AND amount IS NOT NULL
			`;

			const sqlmybl2 = `
				SELECT SUM(amount) AS shurjapay
				FROM payments
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = ?
					AND trafficSource = 'Banglalink'
					AND sp_massage="Success"
					AND sp_massage !=""
					AND sp_massage IS NOT NULL
					AND amount IS NOT NULL
			`;

			const sqlmybl3 = `
				SELECT SUM(amount) AS nagad
				FROM nagad_payment
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = ?
					AND trafficSource = 'Banglalink'
					AND status = 'Success'
					AND amount IS NOT NULL
			`;
			const sqlmybl4 = `
				SELECT SUM(amount) as upay
				FROM upay_payment
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = ?
					AND trafficSource = 'Banglalink'
					AND amount IS NOT NULL
			`;
			const sqlmybl5 = `
				SELECT sum(wbh.amount) as webhook
					FROM (SELECT * FROM bkash_webhook
					WHERE DATE(CONVERT_TZ(trxDate, 'UTC', '+06:00')) = ?
						AND paymentStatus="SUCCEEDED_PAYMENT") wbh
				LEFT JOIN bkash_invoice bi
				ON wbh.subscriptionRequestId = bi.subscriptionRequestId where bi.source ='Banglalink'
			`;

			const myblSqlResponse = await DB.query(sqlmybl1, [item]);
			const myblSqlResponse2 = await DB.query(sqlmybl2, [item]);
			const myblSqlResponse3 = await DB.query(sqlmybl3, [item]);
			const myblSqlResponse4 = await DB.query(sqlmybl4, [item]);
			const myblSqlResponse5 = await DB.query(sqlmybl5, [item]);

			const myBlBkashOneTime = myblSqlResponse[0].bkash ? myblSqlResponse[0].bkash : 0;
			const myBlShurjaPay = myblSqlResponse2[0].shurjapay ? myblSqlResponse2[0].shurjapay : 0;
			const myBlNagadPay = myblSqlResponse3[0].nagad ? myblSqlResponse3[0].nagad : 0;
			const myBlUpayPayment = myblSqlResponse4[0].upay ? myblSqlResponse4[0].upay : 0;
			const myBlWebhookPayment = myblSqlResponse5[0].webhook ? myblSqlResponse5[0].webhook : 0;

			const kabbikQuery1 = `
				SELECT SUM(amount) AS bkash
				FROM bkash_onetime
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = ?
					AND trafficSource != 'Banglalink'
					AND (executeStatusMessage = 'Successful' OR subscribed = 1)
					AND amount IS NOT NULL
			`;

			const kabbikQuery2 = `
				SELECT SUM(amount) AS shurjapay
				FROM payments
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = ?
					AND trafficSource != 'Banglalink'
					AND sp_massage="Success"
					AND sp_massage != ""
					AND sp_massage IS NOT NULL
					AND amount IS NOT NULL
			`;
			const kabbikQuery3 = `
				SELECT SUM(amount) AS nagad
				FROM nagad_payment
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = ?
					AND trafficSource != 'Banglalink'
					AND status = 'Success'
					AND amount IS NOT NULL
			`;
			const kabbikQuery4 = `
				SELECT SUM(amount) AS upay
				FROM upay_payment
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = ?
					AND trafficSource != 'Banglalink'
					AND status = 'success'
					AND amount IS NOT NULL
			`;
			const kabbikQuery5 = `
				SELECT sum(wbh.amount) as webhook
				from (SELECT * FROM bkash_webhook
						WHERE DATE(CONVERT_TZ(trxDate, 'UTC', '+06:00')) = ?
						and paymentStatus = "SUCCEEDED_PAYMENT") wbh
				left join bkash_invoice bi
				on wbh.subscriptionRequestId = bi.subscriptionRequestId
				where bi.source != 'Banglalink'
			`;

			const sqlKabbik = await DB.query(kabbikQuery1, [item]);
			const sqlKabbik2 = await DB.query(kabbikQuery2, [item]);
			const sqlKabbik3 = await DB.query(kabbikQuery3, [item]);
			const sqlKabbik4 = await DB.query(kabbikQuery4, [item]);
			const sqlKabbik5 = await DB.query(kabbikQuery5, [item]);

			const kabbikBkashOnetime = sqlKabbik[0].bkash ? sqlKabbik[0].bkash : 0;
			const kabbikShurjaPay = sqlKabbik2[0].shurjapay ? sqlKabbik2[0].shurjapay : 0;
			const kabbikNagadPayment = sqlKabbik3[0].nagad ? sqlKabbik3[0].nagad : 0;
			const kabbikUpay = sqlKabbik4[0].upay ? sqlKabbik4[0].upay : 0;
			const kabbikWebhook = sqlKabbik5[0].webhook ? sqlKabbik5[0].webhook : 0;

			const result = {
				mybl: {
					item,
					mybl: [
						{
							title: 'Bkash',
							data: myBlBkashOneTime,
							image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png',
						},
						{
							title: 'Shurjapay',
							data: myBlShurjaPay,
							image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png',
						},
						{
							title: 'Nagad',
							data: myBlNagadPay,
							image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png',
						},
						{
							title: 'Upay',
							data: myBlUpayPayment,
							image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png',
						},

						{
							title: 'Bkash Recurring',
							data: myBlWebhookPayment,
							image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png',
						},
					],
				},

				kabbik: {
					item,
					kabbik: [
						{
							title: 'Bkash',
							data: kabbikBkashOnetime,
							image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png',
						},
						{
							title: 'Shurjapay',
							data: kabbikShurjaPay,
						},
						{
							title: 'Nagad',
							data: kabbikNagadPayment,
						},
						{
							title: 'Upay',
							data: kabbikUpay,
						},
						{
							title: 'Bkash Recurring',
							data: kabbikWebhook,
						},
					],
				},
			};

			return result;
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	getPaymentsWeek = async (anchorDay = moment().format('YYYY-MM-DD')) => {
		const dayStrings = [];
		for (let i = 0; i < 7; i++) {
			dayStrings.push(moment(anchorDay, 'YYYY-MM-DD').subtract(i, 'days').format('YYYY-MM-DD'));
		}
		const rows = await Promise.all(dayStrings.map(day => this.getSingleDayTotalPayment(day)));
		return dayStrings.map((day, index) => {
			const result = rows[index];
			const total =
				Array.isArray(result) && result[0]?.total != null ? Number(result[0].total) : 0;
			return { day, total, count: 0 };
		});
	};

	getSingleDayTotalPayment = async day => {
		try {
			const query = `
				SELECT IFNULL(SUM(total), 0) AS total FROM (

				SELECT SUM(amount) AS total
				FROM bkash_onetime
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = '${day}'
					AND executeStatusMessage = 'Successful'
					AND amount IS NOT NULL

				UNION ALL

				SELECT SUM(bw.amount)
				FROM bkash_invoice bi
				JOIN bkash_webhook bw ON bi.subscriptionRequestId = bw.subscriptionRequestId
				WHERE DATE(CONVERT_TZ(bw.trxDate, 'UTC', '+06:00')) = '${day}'
					AND bw.paymentStatus = 'SUCCEEDED_PAYMENT'

				UNION ALL

				SELECT SUM(amount) AS total
				FROM robi_payment
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = '${day}'
					AND status = 'SUCCEEDED'
					AND amount <> ''
					AND amount IS NOT NULL

				UNION ALL

				SELECT SUM(amount) AS total
				FROM nagad_payment
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = '${day}'
					AND status = 'Success'
					AND amount IS NOT NULL
					AND amount >= 0

				UNION ALL

				SELECT SUM(amount) AS total
				FROM upay_payment
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = '${day}'
					AND status = 'success'
					AND amount <> ''
					AND amount IS NOT NULL

				UNION ALL

				SELECT SUM(amount) AS total
				FROM aamarPay
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = '${day}'
					AND ststus = 'Successful'

				UNION ALL

				SELECT SUM(total) AS total
				FROM (
					SELECT
						COALESCE(ROUND(SUM((CASE
							WHEN product_id = 1 THEN 0.99
							WHEN product_id = 2 THEN 4.99
							WHEN product_id = 3 THEN 9.99
						END) * 121.14)), 0) AS total
					FROM stripe_payment sp
					JOIN stripe_webhook sw ON sp.customer_id = sw.customer_id
					WHERE DATE(CONVERT_TZ(sw.created_at, 'UTC', '+06:00')) = '${day}'
						AND sw.cancel_at IS NULL

					UNION ALL

					SELECT
						COALESCE(ROUND(SUM((CASE
							WHEN product_id = 1 THEN 0.99
							WHEN product_id = 2 THEN 4.99
							WHEN product_id = 3 THEN 9.99
						END) * 121.14)), 0) AS total
					FROM stripe_payment
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = '${day}'
						AND is_succeed = 1
				) stripe_combined

				UNION ALL

				SELECT
					ROUND(SUM((CASE
						WHEN gp.packageId = 1 THEN 0.99
						WHEN gp.packageId = 2 THEN 4.99
						WHEN gp.packageId = 3 THEN 9.99
					END) * 121.14)) AS total
				FROM googlepay_invoice gp
				WHERE DATE(CONVERT_TZ(gp.created_at, 'UTC', '+06:00')) = '${day}'
						AND gp.status = 'Success'

				UNION ALL

				SELECT
					ROUND(SUM((CASE
						WHEN packageId = 1 THEN 0.99
						WHEN packageId = 2 THEN 4.99
						WHEN packageId = 3 THEN 9.99
					END) * 121.14)) AS total
				FROM apple_pay
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = '${day}'
						AND status = 'Success'

				) AS total
			`;
			const result = await DB.query(query);
			return result;
		} catch (err) {
			console.error(err);
			return err;
		}
	};

	getPackageWiseRevenue = async (startDate, endDate) => {
		try {

			// DATE(CONVERT_TZ(sl.created_at, '+00:00', '+06:00')) AS created_at
			const query = `
				WITH combined_table AS (
					SELECT SUM(amount) AS total, package_id
					FROM (
						SELECT ROUND(amount) AS amount, packageId AS package_id
						FROM bkash_onetime b1
						WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND executeStatusMessage = 'Successful'
							AND amount IS NOT NULL

						UNION ALL

						SELECT ROUND(bw.amount) AS amount, bi.package_id
						FROM bkash_webhook bw
						JOIN bkash_invoice bi
						ON bw.subscriptionRequestId = bi.subscriptionRequestId
						WHERE DATE(CONVERT_TZ(bw.trxDate, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND bw.paymentStatus = 'SUCCEEDED_PAYMENT'

						UNION ALL

						SELECT ROUND(amount) AS amount, packageId AS package_id
						FROM robi_payment r1
						WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND status = 'SUCCEEDED'
							AND amount <> ''
							AND amount IS NOT NULL

						UNION ALL

						SELECT ROUND(amount) AS amount, packageId AS package_id
						FROM nagad_payment n1
						WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND status = 'Success'
							AND amount IS NOT NULL
							AND amount >= 0

						UNION ALL

						SELECT ROUND(amount) AS amount, packageId AS package_id
						FROM upay_payment u1
						WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND status = 'success'
							AND amount <> ''
							AND amount IS NOT NULL

						UNION ALL

						SELECT ROUND(amount) AS amount, REPLACE(JSON_EXTRACT(body_response, '$.opt_c'), '"', '') AS package_id
						FROM aamarPay a1
						WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND payment_type = 'subscription'
							AND ststus = 'Successful'

						UNION ALL

						SELECT *
						FROM (
							SELECT
								COALESCE(ROUND(SUM((CASE
									WHEN product_id = 1 THEN 0.99
									WHEN product_id = 2 THEN 4.99
									WHEN product_id = 3 THEN 9.99
								END) * 121.14)), 0) AS amount,
								product_id AS package_id
							FROM stripe_payment s1
							WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
								AND is_succeed = 1

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
							WHERE DATE(CONVERT_TZ(sw.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
								AND sw.cancel_at IS NULL
						) stripe_combined

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
						WHERE DATE(CONVERT_TZ(gp.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
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
						WHERE DATE(CONVERT_TZ(ap.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND ap.status = 'Success'
					) dummy
					GROUP BY package_id
					ORDER BY package_id
				)
				SELECT total, name
				FROM combined_table ct
				JOIN subscription_packages sp
				ON ct.package_id = sp.subscriptionItemId
				ORDER BY priority
			`;
			const data = await DB.query(query);
			const total = data.reduce((acc, curr) => acc + curr.total, 0);
			return {
				list: data,
				total,
			};
		} catch (err) {
			throw err;
		}
	};
}

export default new RevenueModel();
