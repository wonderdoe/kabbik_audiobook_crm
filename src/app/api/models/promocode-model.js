import DB from '../../../server/config/db.js';

class PromoModel {
	allPromoList = async (type, offset, limit, startDate, endDate) => {
		try {
			const promocodeListQuery = `
				SELECT * FROM promo
				WHERE DATE(created_at) BETWEEN ? AND ?
				${type !== 'all' ? (type === 'activated' ? 'AND status = 1 ' : 'AND status = 0 ') : ''}
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
			`;
			const totalCountQuery = `
				SELECT COUNT(*) as count FROM promo
				WHERE DATE(created_at) BETWEEN ? AND ?
				${type !== 'all' ? (type === 'activated' ? 'AND status = 1' : 'AND status = 0') : ''}
			`;
			const promocodeListResult = await DB.query(promocodeListQuery, [
				startDate,
				endDate,
				Number(limit),
				Number(offset),
			]);
			const totalCountResult = await DB.query(totalCountQuery, [startDate, endDate]);
			const result = {
				promocodeList: promocodeListResult,
				totalCount: totalCountResult[0].count,
			};
			return result;
		} catch (error) {
			console.log(error);
		}
	};

	findOne = async (promocode, packageId) => {
		try {
			const sql = `SELECT * FROM promo WHERE promocode = ? AND for_package = ?`;
			const result = await DB.query(sql, [promocode, packageId]);
			return result[0];
		} catch (err) {
			console.error(err);
			throw err;
		}
	};

	deactivatedPromo = async () => {
		try {
			const sql = `SELECT * FROM promo WHERE status = 0 ORDER BY created_at DESC`;

			const data = await DB.query(sql);

			return data;
		} catch (error) {
			console.log(error);
		}
	};

	getPromoSubscriptionData = async (promocode, for_package) => {
		try {
			const sql = `
				SELECT COUNT(*) AS count FROM (
					SELECT promo_code, packageId FROM bkash_onetime
					WHERE subscribed = 1 AND promo_code = ? AND packageId = ?
					UNION ALL
					SELECT promoCode AS promo_code, package_id AS packageId FROM bkash_invoice
					WHERE subscribed = 1 AND promoCode = ? AND package_id = ?
					UNION ALL
					SELECT promo_code, packageId FROM nagad_payment
					WHERE status = 'Success' AND promo_code = ? AND packageId = ?
					UNION ALL
					SELECT code AS promo_code, packageId AS packageId FROM upay_payment WHERE status = 'Success'  AND code = ? AND packageId = ?
					UNION ALL
					SELECT promo_code AS promo_code, packageId AS packageId FROM robi_payment WHERE status = 'Success'  AND promo_code = ?  AND packageId = ?
				) AS derived_table_alias
			`;

			const data = await DB.query(sql, [
				promocode,
				for_package,
				promocode,
				for_package,
				promocode,
				for_package,
				promocode,
				for_package,
				promocode,
				for_package,
			]);
			return data;
		} catch (error) {
			console.error(error);

			throw error;
		}
	};

	dateWisePromo = async (offset, limit) => {
		try {
			const sql = `
				SELECT u.*, p.*
				FROM (
					SELECT userId, source, amount, promo_code, packageId, payment_mode, MAX(payment_time) AS payment_time
					FROM (
						SELECT userId, source, created_at AS payment_time, amount, promo_code, packageId, 'bkash_onetime' AS payment_mode
						FROM bkash_onetime
						WHERE ((promo_code IS NOT NULL AND promo_code != '' AND executeStatusMessage = 'Successful') OR subscribed = 1)
						AND (source IS NOT NULL OR source != '')
						AND EXISTS ( SELECT 1 FROM promo WHERE bkash_onetime.promo_code = promo.promocode )

						UNION ALL

						SELECT *
						FROM (
							SELECT bi.userId, bi.source, bi.created_at AS payment_time, wh.amount, bi.promoCode AS promo_code, bi.package_id AS packageId, 'bkash_recurring' AS payment_mode
							FROM bkash_invoice bi
							JOIN bkash_webhook wh ON bi.subscriptionRequestId = wh.subscriptionRequestId
							WHERE wh.paymentStatus = 'SUCCEEDED_PAYMENT'
								AND promoCode IS NOT NULL AND promoCode != '' AND subscribed = 1 AND (source IS NOT NULL OR source != '')
								AND EXISTS ( SELECT 1 FROM promo WHERE bi.promoCode = promo.promocode )
						) AS bkash_recur

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
					) AS all_payments
					GROUP BY userId
				) AS p
				JOIN users AS u ON u.id = p.userId
				ORDER BY payment_time DESC
				LIMIT ${limit} OFFSET ${offset};
			`;

			const sql2 = `
				SELECT COUNT(*) as total_count
				FROM (
					SELECT userId, source, amount, promo_code, packageId, payment_mode, MAX(payment_time) AS payment_time
					FROM (
						SELECT userId, source, created_at AS payment_time, amount, promo_code, packageId, 'bkash_onetime' AS payment_mode
						FROM bkash_onetime
						WHERE ((promo_code IS NOT NULL AND promo_code != '' AND executeStatusMessage = 'Successful') OR subscribed = 1)
						AND (source IS NOT NULL OR source != '')
						AND EXISTS ( SELECT 1 FROM promo WHERE bkash_onetime.promo_code = promo.promocode )

						UNION ALL

						SELECT *
						FROM (
							SELECT bi.userId, bi.source, bi.created_at AS payment_time, wh.amount, bi.promoCode AS promo_code, bi.package_id AS packageId, 'bkash_recurring' AS payment_mode
							FROM bkash_invoice bi
							JOIN bkash_webhook wh ON bi.subscriptionRequestId = wh.subscriptionRequestId
							WHERE wh.paymentStatus = 'SUCCEEDED_PAYMENT'
								AND promoCode IS NOT NULL AND promoCode != '' AND subscribed = 1 AND (source IS NOT NULL OR source != '')
								AND EXISTS ( SELECT 1 FROM promo WHERE bi.promoCode = promo.promocode )
						) AS bkash_recur

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
					) AS all_payments
					GROUP BY userId
				) AS p
				JOIN users AS u ON u.id = p.userId
			`;
			const data = await DB.query(sql);
			const data2 = await DB.query(sql2);
			const response = {
				data,
				total: data2[0].total_count,
			};
			return response;
		} catch (error) {
			throw error; // Handle error appropriately
		}
	};

	addPromo = async (promocode, for_package, reduce_price, promo_type, bank_name) => {
		try {
			const sql = `INSERT INTO promo (promocode, reduce_price, status, for_package,promo_type,bank_name) VALUES (?, ?, 1, ?,?,?)`;

			const data = await DB.query(sql, [
				promocode,
				reduce_price,
				for_package,
				promo_type,
				bank_name,
			]);

			return data;
		} catch (error) {
			console.log(error);
		}
	};

	togglePromocodeActivity = async id => {
		try {
			const query = 'UPDATE promo SET status = CASE WHEN status = 0 THEN 1 ELSE 0 END WHERE id = ?';
			const result = await DB.query(query, [id]);
			return result;
		} catch (err) {
			console.error(err);
		}
	};

	getAllPromocode = async () => {
		try {
			const query = `
				SELECT promocode FROM promo pr
				JOIN packages pk ON pk.id = pr.for_package
				GROUP BY pr.promocode
				ORDER BY pr.promocode
			`;
			const result = await DB.query(query);
			return result.map(item => item.promocode);
		} catch (err) {
			console.error(err);
			return err;
		}
	};

	searchPromocodeGroupwise = async searchParams => {
		const { startDate, endDate, promocode, limit, offset, promocodeType } = searchParams;
		try {
			const queryList = `
				WITH all_payments AS (
						SELECT promo_code, packageId, created_at
						FROM bkash_onetime
						WHERE subscribed = 1 AND promo_code != '' AND promo_code IS NOT NULL AND promo_code != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE promo_code = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'

						UNION ALL

						SELECT promoCode, package_id, created_at
						FROM bkash_invoice
						WHERE subscribed = 1 AND promoCode != '' AND promoCode IS NOT NULL AND promoCode != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE promoCode = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'

						UNION ALL

						SELECT promo_code, packageId, created_at
						FROM nagad_payment
						WHERE LCASE(status) = 'success' AND promo_code != '' AND promo_code IS NOT NULL AND promo_code != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE promo_code = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'

						UNION ALL

						SELECT code, packageId, created_at
						FROM upay_payment
						WHERE LCASE(status) = 'success' AND code != '' AND code IS NOT NULL AND code != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE code = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'

						UNION ALL

						SELECT promo_code, packageId, created_at
						FROM robi_payment
						WHERE LCASE(status) = 'success' AND promo_code != '' AND promo_code IS NOT NULL AND promo_code != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE promo_code = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'
				)

				SELECT
						promo.id,
						promo.promocode AS promo_code,
						promo.for_package,
						packages.name,
						promo.reduce_price,
						COALESCE(COUNT(all_payments.promo_code), 0) AS promo_count,
						promo.created_at,
						promo.updated_at,
						promo.status,
						promo.promo_type,
						promo.bank_name
				FROM promo
				RIGHT JOIN packages ON promo.for_package = packages.id
				LEFT JOIN all_payments ON promo.promocode = all_payments.promo_code AND promo.for_package = all_payments.packageId
				GROUP BY promo.promocode, promo.for_package, packages.name
				${
					promocode.length
						? `HAVING promo_code = '${promocode}'`
						: `
					${promocodeType === 'activated' ? 'HAVING promo.status = 1' : promocodeType === 'deactivated' ? 'HAVING promo.status = 0' : ''}
				`
				}
				ORDER BY promo.created_at DESC
				LIMIT ${Number(limit)} OFFSET ${Number(offset)}
			`;
			const resultList = await DB.query(queryList);
			const queryTotal = `
				WITH all_payments AS (
						SELECT promo_code, packageId, created_at
						FROM bkash_onetime
						WHERE subscribed = 1 AND promo_code != '' AND promo_code IS NOT NULL AND promo_code != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE promo_code = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'

						UNION ALL

						SELECT promoCode, package_id, created_at
						FROM bkash_invoice
						WHERE subscribed = 1 AND promoCode != '' AND promoCode IS NOT NULL AND promoCode != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE promoCode = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'

						UNION ALL

						SELECT promo_code, packageId, created_at
						FROM nagad_payment
						WHERE LCASE(status) = 'success' AND promo_code != '' AND promo_code IS NOT NULL AND promo_code != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE promo_code = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'

						UNION ALL

						SELECT code, packageId, created_at
						FROM upay_payment
						WHERE LCASE(status) = 'success' AND code != '' AND code IS NOT NULL AND code != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE code = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'

						UNION ALL

						SELECT promo_code, packageId, created_at
						FROM robi_payment
						WHERE LCASE(status) = 'success' AND promo_code != '' AND promo_code IS NOT NULL AND promo_code != 'N/A'
						AND EXISTS (SELECT 1 FROM promo WHERE promo_code = promo.promocode)
						AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'
				)

				SELECT
						promo.promocode AS promo_code,
						promo.for_package,
						packages.name,
						promo.status,
						COALESCE(COUNT(all_payments.promo_code), 0) AS promo_count
				FROM promo
				RIGHT JOIN packages ON promo.for_package = packages.id
				LEFT JOIN all_payments ON promo.promocode = all_payments.promo_code AND promo.for_package = all_payments.packageId
				GROUP BY promo.promocode, promo.for_package, packages.name
				${
					promocode.length
						? `HAVING promo_code = '${promocode}'`
						: `
					${promocodeType === 'activated' ? 'HAVING promo.status = 1' : promocodeType === 'deactivated' ? 'HAVING promo.status = 0' : ''}
				`
				}
			`;
			const resultCount = await DB.query(queryTotal, [
				startDate,
				endDate,
				startDate,
				endDate,
				startDate,
				endDate,
				startDate,
				endDate,
				startDate,
				endDate,
			]);
			return { promocodeList: resultList, total: resultCount.length };
		} catch (err) {
			console.error(err);
			return err;
		}
	};

	getTopMostUsedPromocodes = async day => {
		try {
			const query = `
				WITH all_payments AS (
					SELECT promo_code, packageId, created_at FROM bkash_onetime
					WHERE subscribed = 1 AND promo_code != '' AND promo_code IS NOT NULL AND promo_code != 'N/A'
					AND EXISTS ( SELECT 1 FROM promo WHERE promo_code = promo.promocode )
					AND CAST(created_at AS DATE) = ?
					UNION ALL
					SELECT promoCode, package_id, created_at FROM bkash_invoice
					WHERE subscribed = 1 AND promoCode != '' AND promoCode IS NOT NULL AND promoCode != 'N/A'
					AND EXISTS ( SELECT 1 FROM promo WHERE promoCode = promo.promocode )
					AND CAST(created_at AS DATE) = ?
					UNION ALL
					SELECT promo_code, packageId, created_at FROM nagad_payment
					WHERE LCASE(status) = 'success' AND promo_code != '' AND promo_code IS NOT NULL AND promo_code != 'N/A'
					AND EXISTS ( SELECT 1 FROM promo WHERE promo_code = promo.promocode )
					AND CAST(created_at AS DATE) = ?
					UNION ALL
					SELECT code, packageId, created_at FROM upay_payment
					WHERE LCASE(status) = 'success' AND code != '' and code IS NOT NULL AND code != 'N/A'
					AND EXISTS ( SELECT 1 FROM promo WHERE code = promo.promocode )
					AND CAST(created_at AS DATE) = ?
					UNION ALL
					SELECT promo_code, packageId, created_at FROM robi_payment
					WHERE LCASE(status) = 'success' AND promo_code != '' AND promo_code IS NOT NULL AND promo_code != 'N/A'
					AND EXISTS ( SELECT 1 FROM promo WHERE promo_code = promo.promocode )
					AND CAST(created_at AS DATE) = ?
				)

				SELECT all_payments.promo_code, all_payments.packageId, packages.name, COUNT(*) AS promo_count
				FROM all_payments
				JOIN packages ON packages.id = packageId
				GROUP BY all_payments.promo_code, all_payments.packageId, packages.name
				ORDER BY promo_count DESC
				LIMIT 5
			`;
			const result = await DB.query(query, [day, day, day, day, day]);
			return result;
		} catch (err) {
			console.error(err);
			return err;
		}
	};

	addListOfBinsWithoutCardType = async jsonBody => {
		try {
			const { promo_id, for_package, binNumbers, status } = jsonBody;
			if (jsonBody.binNumbers.length) {
				const query = `
					INSERT INTO promo_bin_mapping (promo_id, bin_number, for_package, status)
						VALUES ${binNumbers.map(num => `(${promo_id}, ${num}, ${for_package}, ${status})`).join(', ')}
				`;
				const result = await DB.query(query);
				if (result.affectedRows) {
					return { message: 'BIN numbers added', status: 200 };
				}
				return { message: 'No BIN numbers added', status: 400 };
			} else {
				return { message: 'No BIN numbers added', status: 400 };
			}
		} catch (err) {
			console.error(err);
			throw err;
		}
	};
}

export default new PromoModel();
