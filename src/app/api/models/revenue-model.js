import moment from 'moment';
import DB from '../../../server/config/db';
import {addDays} from "../helpers/commonFunction"
import { calculatePercentage } from '@/helper/Commonfunction';

export const dynamic = 'force-dynamic';
class RevenueModel {
	getReport = async (startDate, endDate) => {
		try {
			const query = `
				SELECT
					IFNULL(SUM(total), 0) AS total_amount,
					payment_source,
					image,
					new_subscribers
				FROM (
					SELECT
						COALESCE(ROUND(SUM(amount)), 0) AS total,
						'Bkash Onetime Payment' AS payment_source,
						'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png' AS image,
						COALESCE(SUM(CASE
							WHEN (SELECT COUNT(*) FROM bkash_onetime b2 WHERE b2.userId = b1.userId) = 1
							THEN 1 ELSE 0
						END), 0) AS new_subscribers
					FROM bkash_onetime b1
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND executeStatusMessage = 'Successful'
						AND amount IS NOT NULL

					UNION ALL

					SELECT
						COALESCE(ROUND(SUM(amount)), 0) AS total,
						'Bkash Recurring Payment' AS payment_source,
						'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png' AS image,
						COALESCE(SUM(CASE
							WHEN firstPayment = 1 THEN 1
							ELSE 0
						END), 0) AS new_subscribers
					FROM bkash_webhook
					WHERE DATE(CONVERT_TZ(trxDate, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND paymentStatus = 'SUCCEEDED_PAYMENT'

					UNION ALL

					SELECT
						COALESCE(ROUND(SUM(amount)), 0) AS total,
						'Robi Payment' AS payment_source,
						'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779411161.png' AS image,
						COALESCE(SUM(CASE
							WHEN (SELECT COUNT(*) FROM robi_payment r2 WHERE r1.userId = r2.userId) = 1
							THEN 1 ELSE 0
						END), 0) AS new_subscribers
					FROM robi_payment r1
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND status = 'SUCCEEDED'
						AND amount <> ''
						AND amount IS NOT NULL

					UNION ALL

					SELECT
						COALESCE(ROUND(SUM(amount)), 0) AS total,
						'Nagad Payment' AS payment_source,
						'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779396431.png' AS image,
						COALESCE(SUM(CASE
							WHEN (SELECT COUNT(*) FROM nagad_payment n2 WHERE n1.userId = n2.userId) = 1
							THEN 1 ELSE 0
						END), 0) AS new_subscribers
					FROM nagad_payment n1
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND status = 'Success'
						AND amount IS NOT NULL
						AND amount >= 0

					UNION ALL

					SELECT
						COALESCE(ROUND(SUM(amount)), 0) AS total,
						'Upay Payment' AS payment_source,
						'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779447112.png' AS image,
						COALESCE(SUM(CASE
							WHEN (SELECT COUNT(*) FROM upay_payment u2 WHERE u1.userId = u2.userId) = 1
							THEN 1 ELSE 0
						END), 0) AS new_subscribers
					FROM upay_payment u1
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND status = 'success'
						AND amount <> ''
						AND amount IS NOT NULL

					UNION ALL

					SELECT
						COALESCE(ROUND(SUM(amount)), 0) AS total,
						'Aamarpay Payment' AS payment_source,
						'https://kabbik-ab-bucket.s3.ap-south-1.amazonaws.com/1685361594336.png' AS image,
						COALESCE(SUM(CASE
							WHEN (SELECT COUNT(*) FROM aamarPay a2 WHERE a1.user_id = a2.user_id) = 1
							THEN 1 ELSE 0
						END), 0) AS new_subscribers
					FROM aamarPay a1
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND payment_type = 'subscription'
						AND ststus = 'Successful'

					UNION ALL

					SELECT
						SUM(total) AS total,
						'Stripe Payment' AS payment_source,
						'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/strip.png' AS image,
						SUM(new_subscribers) AS new_subscribers
					FROM (
						SELECT
							COALESCE(ROUND(SUM((CASE
								WHEN product_id = 1 THEN 0.99
								WHEN product_id = 2 THEN 4.99
								WHEN product_id = 3 THEN 9.99
							END) * 121.14)), 0) AS total,
							COALESCE(SUM(CASE
								WHEN (SELECT COUNT(*) FROM stripe_payment s2 WHERE s1.user_id = s2.user_id) = 1
								THEN 1 ELSE 0
							END), 0) AS new_subscribers
						FROM stripe_payment s1
						WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND is_succeed = 1

						UNION ALL

						SELECT ROUND(SUM(CASE sp.product_id
								WHEN 1 THEN 0.99
								WHEN 2 THEN 4.99
								WHEN 3 THEN 9.99
							END * 121.14)) AS total,
							COALESCE(SUM(CASE
								WHEN (SELECT COUNT(*) FROM stripe_payment s2 WHERE sp.user_id = s2.user_id) = 1
								THEN 1 ELSE 0
							END), 0) AS new_subscribers
						FROM stripe_webhook sw
						JOIN stripe_payment sp ON sw.customer_id = sp.customer_id
						WHERE DATE(CONVERT_TZ(sw.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND sw.cancel_at IS NULL
					) stripe_combined

					UNION ALL

					SELECT
						COALESCE(ROUND(SUM((CASE
							WHEN gp.packageId = 1 THEN 0.99
							WHEN gp.packageId = 2 THEN 4.99
							WHEN gp.packageId = 3 THEN 9.99
						END) * 121.14)), 0) AS total,
						'Googlepay Payment' AS payment_source,
						'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/googlepay.png' AS image,
						COALESCE(SUM(CASE
							WHEN rw.event_type = 'INITIAL_PURCHASE' THEN 1
							ELSE 0
						END), 0) AS new_subscribers
					FROM googlepay_invoice gp
					JOIN revenuecat_webhook rw ON gp.userId = rw.app_user_id
					WHERE DATE(CONVERT_TZ(gp.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND gp.status = 'Success'

					UNION ALL

					SELECT
						COALESCE(ROUND(SUM((CASE
							WHEN ap.packageId = 1 OR ap.packageId = 'kabbik_99' THEN 0.99
							WHEN ap.packageId = 2 OR ap.packageId = 'kabbik_499_6m' THEN 4.99
							WHEN ap.packageId = 3 OR ap.packageId = 'kabbik_999_1y' THEN 9.99
						END) * 121.14)), 0) AS total,
						'Applepay Payment' AS payment_source,
						'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/applepay.png' AS image,
						COALESCE(SUM(CASE
							WHEN rw.event_type = 'INITIAL_PURCHASE' THEN 1
							ELSE 0
						END), 0) AS new_subscribers
					FROM apple_pay ap
					LEFT JOIN revenuecat_webhook rw ON ap.userId = rw.app_user_id
					WHERE DATE(CONVERT_TZ(ap.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND ap.status = 'Success'
				) AS merged_data
				GROUP BY payment_source;
			`;
			let newDate=addDays(endDate,0)
			// a comment
			const newQuery=` 
					select 
					round(sum(spl.amount)) as total_amount, 
					spl.is_recurring,
					spl.payment_method AS payment_source, DATE(CONVERT_TZ(spl.created_at, 'UTC', '+06:00')) AS created_at,
					SUM(CASE WHEN spl.is_first_payment = 1 AND spl.rent_payment = 0 THEN 1 ELSE 0 END) AS new_subscribers,
					SUM(CASE WHEN spl.is_first_payment = 0 AND spl.rent_payment = 0 THEN 1 ELSE 0 END) AS old_subscribers
					from user_subscription_payment_log as spl
					WHERE 
					payment_status = 'SUCCEEDED_PAYMENT'
					and spl.isCancelled=0
					and DATE(CONVERT_TZ(spl.created_at, 'UTC', '+06:00'))
						BETWEEN '${startDate}' AND '${newDate}'
					GROUP BY  
					spl.payment_method, 
					spl.is_recurring
			;`
			// testing comment
			const result = await DB.query(query);
			let newResult = await DB.query(newQuery)
			let getData=(item)=>{
				if(item?.payment_source==="Bkash")
					return {...item,
								image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png",
								payment_source:item.is_recurring? "Bkash Recurring Payment" :"Bkash Onetime Payment"
							}
				if(item?.payment_source==="NAGAD")
					return {...item, payment_source:"Nagad Payment",
								image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779396431.png"
							}
				if(item?.payment_source==="AAMARPAY")
					return {...item,image:"https://kabbik-ab-bucket.s3.ap-south-1.amazonaws.com/1685361594336.png",payment_source:"Aamarpay Payment"}
				if(item?.payment_source==="ROBI")
					return {...item,total_amount:calculatePercentage(item.total_amount,49),image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779411161.png",payment_source:item.is_recurring?"Robi Payment Recurring":"Robi Onetime Payment"}
				if(item?.payment_source==="BL")
					return {...item,total_amount:calculatePercentage(item.total_amount,50),image:"/images/BLlogopng.png",payment_source:item.is_recurring?"BL Payment Recurring":"BL Onetime Payment"}
				// if(item?.payment_source==="ROBI")
				// 	return {...item,image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779411161.png",payment_source:"Robi Payment"}
				if(item?.payment_source==="GP")
					return {...item,total_amount:calculatePercentage(item.total_amount,70),image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/grameen%20.png",payment_source:item.is_recurring?"GP Recurring Payment": "GP Onetime Payment"}
				if(item?.payment_source==="APP_STORE")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/applepay.png",
						payment_source:item.is_recurring?"Apple Pay Recurring Payment":"Apple Pay Onetime Payment"		
					}
				if(item?.payment_source==="PLAY_STORE")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/googlepay.png",
						payment_source:item.is_recurring?"Google Pay Recurring Payment":"Google Pay Onetime Payment"
					}
				if(item?.payment_source==="STRIPE")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/strip.png",
						payment_source:item.is_recurring?"Stripe Recurring Payment":"Stripe Onetime Payment"
					}
			}
			let newData=newResult.map((item)=>getData(item))
			return newData;
		} catch (error) {
			console.log(error);
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
			const myblQuery = `
				SELECT payment_type, dt AS payment_date, total
				FROM (
					SELECT SUM(amount) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'onetime' AS payment_type
					FROM bkash_onetime
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND executeStatusMessage = 'Successful'
						AND amount IS NOT NULL
						AND trafficSource = 'Banglalink'
					GROUP BY dt

					UNION ALL

					SELECT SUM(wbh.amount) AS total, DATE(CONVERT_TZ(trxDate, 'UTC', '+06:00')) AS dt, 'recurring' AS payment_type
					FROM bkash_webhook wbh
					LEFT JOIN bkash_invoice bi ON wbh.subscriptionRequestId = bi.subscriptionRequestId
					WHERE DATE(CONVERT_TZ(trxDate, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND paymentStatus = "SUCCEEDED_PAYMENT"
						AND bi.source = 'Banglalink'
					GROUP BY dt

					UNION ALL

					SELECT SUM(amount) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'nagad' AS payment_type
					FROM nagad_payment
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND (amount IS NOT NULL OR amount != 0)
						AND status = 'Success'
						AND trafficSource = 'Banglalink'
					GROUP BY dt

					UNION ALL

					SELECT SUM(amount) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'upay' AS payment_type
					FROM upay_payment
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND (amount IS NOT NULL OR amount != 0)
						AND status = 'success'
						AND trafficSource = 'Banglalink'
					GROUP BY dt

					UNION ALL

					SELECT SUM(amount) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'aamarpay' AS payment_type
					FROM aamarPay
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND (amount IS NOT NULL OR amount != 0)
						AND payment_type = 'subscription'
						AND ststus = 'Successful'
						AND trafficSource = 'Banglalink'
					GROUP BY dt
				) AS all_amounts
				ORDER BY payment_date DESC
			`;

			let newEndDate= addDays(endDate,1);

			const newMyBlQuery=`  SELECT round(SUM(spl.amount)) AS total, spl.payment_method as payment_type,rent_payment,
				spl.is_recurring,date(convert_tz(spl.created_at,'+00:00','+06:00')) AS payment_date
				FROM user_subscription_payment_log AS spl 
			WHERE payment_status='SUCCEEDED_PAYMENT' 
				AND from_banglalink=1 AND 
				convert_tz(spl.created_at,'+00:00','+06:00') BETWEEN '${startDate}' AND '${newEndDate}'
			GROUP BY DATE(convert_tz(created_at,'+00:00','+06:00')),payment_method,is_recurring,rent_payment;`;

			const kabbikQuery = `
				SELECT payment_type, dt AS payment_date, total
				FROM (
					SELECT SUM(amount) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'onetime' AS payment_type
					FROM bkash_onetime
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND executeStatusMessage = 'Successful'
						AND amount IS NOT NULL
						AND (trafficSource = '' OR trafficSource IS NULL)
					GROUP BY dt

					UNION ALL

					SELECT SUM(wbh.amount) AS total, DATE(CONVERT_TZ(trxDate, 'UTC', '+06:00')) AS dt, 'recurring' AS payment_type
					FROM bkash_webhook wbh
					LEFT JOIN bkash_invoice bi ON wbh.subscriptionRequestId = bi.subscriptionRequestId
					WHERE DATE(CONVERT_TZ(trxDate, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND paymentStatus = "SUCCEEDED_PAYMENT"
						AND (bi.source IS NULL OR bi.source = '')
					GROUP BY dt

					UNION ALL

					SELECT SUM(amount) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'robi' AS payment_type
					FROM robi_payment
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND status = 'SUCCEEDED'
						AND amount <> ''
						AND amount IS NOT NULL
						AND from_channel <> 'MyBL'
					GROUP BY dt

					UNION ALL

					SELECT SUM(amount) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'nagad' AS payment_type
					FROM nagad_payment
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND status = 'Success'
						AND amount IS NOT NULL
						AND (trafficSource IS NULL OR trafficSource = '')
					GROUP BY dt

					UNION ALL

					SELECT SUM(amount) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'upay' AS payment_type
					FROM upay_payment
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND status = 'success'
						AND amount IS NOT NULL
						AND (trafficSource IS NULL OR trafficSource = '')
					GROUP BY dt

					UNION ALL

					SELECT ROUND(SUM(amount)) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'aamarpay' AS payment_type
					FROM aamarPay
					WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND ststus = 'Successful'
						AND payment_type = 'subscription'
						AND (trafficSource = 'Kabbik' OR trafficSource = '' OR platform = 'Kabbik')
					GROUP BY dt

					UNION ALL

					SELECT
						SUM(total) AS total, DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt, 'stripe' AS payment_type
					FROM (
						SELECT ROUND(CASE product_id
								WHEN 1 THEN 0.99
								WHEN 2 THEN 4.99
								WHEN 3 THEN 9.99
							END * 121.14) AS total,
							created_at
						FROM stripe_payment
						WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND is_succeed = 1

						UNION ALL

						SELECT ROUND(CASE sp.product_id
								WHEN 1 THEN 0.99
								WHEN 2 THEN 4.99
								WHEN 3 THEN 9.99
							END * 121.14) AS total,
							sw.created_at
						FROM stripe_webhook sw
						JOIN stripe_payment sp ON sw.customer_id = sp.customer_id
						WHERE DATE(CONVERT_TZ(sw.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
							AND sw.cancel_at IS NULL
					) AS combined_stripe_payment
					GROUP BY dt

					UNION ALL

					SELECT
						ROUND(SUM((CASE
							WHEN gp.packageId = 1 THEN 0.99
							WHEN gp.packageId = 2 THEN 4.99
							WHEN gp.packageId = 3 THEN 9.99
						END) * 121.14)) AS total,
						DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) AS dt,
						'googlepay' AS payment_type
					FROM googlepay_invoice gp
					WHERE DATE(CONVERT_TZ(gp.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND gp.status = 'Success'
					GROUP BY dt

					UNION ALL

					SELECT
						ROUND(SUM((CASE
							WHEN ap.packageId = 1 OR ap.packageId = 'kabbik_99' THEN 0.99
							WHEN ap.packageId = 2 OR ap.packageId = 'kabbik_499_6m' THEN 4.99
							WHEN ap.packageId = 3 OR ap.packageId = 'kabbik_999_1y' THEN 9.99
						END) * 121.14)) AS total,
						DATE(CONVERT_TZ(ap.created_at, 'UTC', '+06:00')) AS dt,
						'applepay' AS payment_type
					FROM apple_pay ap
					WHERE DATE(CONVERT_TZ(ap.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
						AND ap.status = 'Success'
					GROUP BY dt
				) AS all_amounts
				WHERE total IS NOT NULL AND dt IS NOT NULL
				ORDER BY payment_date DESC
			`;
			
			

			const newKabbikQuery=`
			SELECT round(SUM(spl.amount)) AS total, spl.payment_method as payment_type,rent_payment,
				spl.is_recurring,DATE(CONVERT_TZ(spl.created_at, 'UTC', '+06:00')) AS payment_date
				FROM user_subscription_payment_log AS spl 
			WHERE payment_status='SUCCEEDED_PAYMENT' and spl.isCancelled=0 and
				DATE(CONVERT_TZ(spl.created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${newEndDate}'
			GROUP BY DATE(CONVERT_TZ(spl.created_at, 'UTC', '+06:00')),payment_method,is_recurring,rent_payment;`

			const courseQuery = `
				SELECT SUM(amount) AS total,
					DATE(CONVERT_TZ(created_at, 'UTC', + '+06:00')) AS payment_date,
					LOWER(payment_method) AS payment_type
				FROM store_log
				WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) BETWEEN '${startDate}' AND '${endDate}'
					AND purchase_type = 'course'
					AND is_succeed
				GROUP BY payment_date, payment_type
				ORDER BY payment_date DESC
			`;
			const myblResult = await DB.query(myblQuery);
			let newMyblResult = await DB.query(newMyBlQuery);
			
			// const kabbikResult = await DB.query(kabbikQuery);
			let newkabbikResult = await DB.query(newKabbikQuery);
			
			const courseResult = await DB.query(courseQuery);
			let myblRevenue = {},
				kabbikRevenue = {},
				courseRevenue = {};
			// for (const row of myblResult) {
			// 	const date = moment(row.payment_date).format('YYYY-MM-DD');
			// 	if (!(date in myblRevenue)) {
			// 		myblRevenue[date] = {};
			// 	}
			newMyblResult = newMyblResult.sort((a,b)=>b.payment_date-a.payment_date)
			for (const row of newMyblResult) {
				const date = moment(row.payment_date).format('YYYY-MM-DD');
				if (!(date in myblRevenue)) {
					myblRevenue[date] = {};
				}
				myblRevenue[date][row.payment_type+"-"+`${row.is_recurring?"recurring":"onetime"}${row.rent_payment}`] = row.total;
			}
			// 	myblRevenue[date][row.payment_type] = row.total;
			// }
			// for (const row of kabbikResult) {
			// 	const date = moment(row.payment_date).format('YYYY-MM-DD');
			// 	if (!(date in kabbikRevenue)) {
			// 		kabbikRevenue[date] = {};
			// 	}
			// 	kabbikRevenue[date][row.payment_type] = row.total;
			// }
			newkabbikResult = newkabbikResult.sort((a,b)=>b.payment_date-a.payment_date)
			for (const row of newkabbikResult) {
				const date = moment(row.payment_date).format('YYYY-MM-DD');
				if (!(date in kabbikRevenue)) {
					kabbikRevenue[date] = {};
				}
				if(row.payment_type?.toLowerCase()==='bl'){
					kabbikRevenue[date][row.payment_type+"-"+`${row.is_recurring?"recurring":"onetime"}${row.rent_payment}`] = calculatePercentage(row.total,50);
				}
				else if(row.payment_type.toLowerCase()==='robi'){
					kabbikRevenue[date][row.payment_type+"-"+`${row.is_recurring?"recurring":"onetime"}${row.rent_payment}`] = calculatePercentage(row.total,49);
				}
				else if(row.payment_type.toLowerCase()==='gp'){
					kabbikRevenue[date][row.payment_type+"-"+`${row.is_recurring?"recurring":"onetime"}${row.rent_payment}`] = calculatePercentage(row.total,70);
				}else{
					kabbikRevenue[date][row.payment_type+"-"+`${row.is_recurring?"recurring":"onetime"}${row.rent_payment}`] = row.total;
				}
			}
			for (const row of courseResult) {
				const date = moment(row.payment_date).format('YYYY-MM-DD');
				if (!(date in courseRevenue)) {
					courseRevenue[date] = {};
				}
				courseRevenue[date][row.payment_type] = row.total;
			}
			return {
				mybl: myblRevenue,
				kabbik: kabbikRevenue,
				course: courseRevenue,
			};
		} catch (error) {
			console.log(error);
			// Rethrow error to handle it at a higher level
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
