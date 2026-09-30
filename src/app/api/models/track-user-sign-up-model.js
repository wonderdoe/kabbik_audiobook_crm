import DB from '../../../server/config/db.js';

class TrackUserSignUpModel {
	getList = async (startDate, endDate) => {
		try {
			const sql = `SELECT count(*) as my_bl_count FROM users WHERE created_at BETWEEN ? AND ? AND client_id IS NOT NULL AND (client_id = "mybl-client-2024" OR client_id = "client_id")`;
			const sql2 = `SELECT count(*) as toffe_count FROM users WHERE created_at BETWEEN ? AND ? AND client_id IS NOT NULL AND (client_id = "toffee-client-2024")`;
			const sql3 = `SELECT count(*) as kabbik_count FROM users WHERE created_at BETWEEN ? AND ? AND client_id IS NULL`;

			const sqlResponse = await DB.query(sql, [startDate, endDate]);
			const sqlResponse2 = await DB.query(sql2, [startDate, endDate]);
			const sqlResponse3 = await DB.query(sql3, [startDate, endDate]);

			const result = [
				{
					title: 'MyBL Sign Up',
					count: sqlResponse[0].my_bl_count,
					image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png',
				},
				{
					title: 'Toffee Sign Up',
					count: sqlResponse2[0].toffe_count,
					image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780502718.png',
				},
				{
					title: 'Kabbik Sign Up',
					count: sqlResponse3[0].kabbik_count,
					image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png',
				},
			];
			return result;
		} catch (error) {
			console.error('Error executing SQL query:', error);
			throw error; // Rethrow the error for further handling
		}
	};

	getLastSevenDaysList = async () => {
		try {
			const result = [];

			for (let i = 0; i < 8; i++) {
				const currentDate = new Date();

				currentDate.setDate(currentDate.getDate() - i);
				const formattedDate = currentDate.toISOString().slice(0, 10);

				const sql = `SELECT count(*) as my_bl_count FROM users WHERE DATE(created_at) = '${formattedDate}' AND client_id IS NOT NULL AND (client_id = "mybl-client-2024" OR client_id = "client_id")`;
				const sql2 = `SELECT count(*) as toffee_count FROM users WHERE DATE(created_at) = '${formattedDate}' AND client_id IS NOT NULL AND client_id = "toffee-client-2024"`;
				const sql3 = `SELECT count(*) as kabbik_count FROM users WHERE DATE(created_at) = '${formattedDate}' AND client_id IS NULL`;

				const sqlResponse = await DB.query(sql);
				const sqlResponse2 = await DB.query(sql2);
				const sqlResponse3 = await DB.query(sql3);

				result.push({
					date: formattedDate,
					myBLCount: sqlResponse[0].my_bl_count,
					toffeeCount: sqlResponse2[0].toffee_count,
					kabbikCount: sqlResponse3[0].kabbik_count,
				});
			}

			return result;
		} catch (error) {
			console.error('Error executing SQL query:', error);
			throw error; // Rethrow the error for further handling
		}
	};
}

export default new TrackUserSignUpModel();
