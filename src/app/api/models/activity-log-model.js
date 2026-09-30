import moment from 'moment';
import DB from '../../../server/config/db.js';

class Activity_log_mdel {
	tableName = 'activity_log';

	creteLog = async (data) => {
		try {
            console.log(data);
            const { user_id, user_email, api_end_point,payload,action_type,name,device_info } = data;
			const sql = "INSERT INTO activity_log (user_id, user_email, api_end_point,payload,action_type,name,device_info) VALUES (?, ?, ?, ?, ?, ?,?)";
			const result = await DB.query(sql, [user_id, user_email, api_end_point,payload,action_type,name,device_info]);
			return result;
		} catch (err) {
			return err;
		}
	};
}

export default new Activity_log_mdel();
