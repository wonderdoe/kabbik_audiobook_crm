import moment from 'moment';
import DB from '../../../server/config/db.js';
import { addDays } from '../helpers/commonFunction';

class TopListnerModel {
    tableName = 'users';
    

    getTopListners = async (startDate, endDate,limit,promo_code) => {
        try {
            let newDate=addDays(endDate,1);
            const query = `
               SELECT k.user_id,SUM(k.active_time) AS total_active_time,u.user_email,SUM(k.streaming_time) AS total_streaming_time,
               u.full_name,u.phone_no,v.payer,v.promo_code,v.payment_method,v.created_at AS last_payment
                FROM kabbik_statistics k
                LEFT JOIN users u ON u.id=k.user_id
                LEFT JOIN (
                    SELECT payer,payment_method,created_at,user_id,promo_code FROM (
                            SELECT payer,payment_method,created_at,user_id,promo_code,
                            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at desc)  AS rnk
                            FROM user_subscription_payment_log WHERE payment_status='SUCCEEDED_PAYMENT'
                        ) AS vw WHERE rnk=1
                ) AS v ON u.id=v.user_id 
                WHERE DATE BETWEEN '${startDate}' AND '${newDate}'
                        AND u.is_subscribed=1
                        ${promo_code?	`AND v.promo_code='${promo_code}'`:``}
                GROUP BY user_id ORDER BY total_streaming_time DESC
                LIMIT ${limit??10} 
            `;
            const result = await DB.query(query, [startDate, endDate]);
            
            return result;
        } catch (err) {
            return err;
        }
    };
}

export default new TopListnerModel();
