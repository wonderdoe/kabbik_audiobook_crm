import DB from '../../../server/config/db';


export const dynamic = 'force-dynamic';

class PublisherModel {
	tableName = 'book_publishers';
	getPublisherList = async (offset, limit) => {
		try {
			const sql = `SELECT * FROM ${this.tableName} WHERE email IS NOT NULL ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
			const sql2 = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email IS NOT NULL`;
			const data = await DB.query(sql);
			const sqlRresponse2 = await DB.query(sql2);
			const results = {
				data,
				total: sqlRresponse2[0],
			};

			return results;
		} catch (error) {
			console.log(error);
		}
	};
	getPublisherName = async () => {
		try {
			const sql = `
				SELECT DISTINCT *
				FROM ${this.tableName}
				WHERE email IS NOT NULL
				
				ORDER BY created_at DESC
			`;
			// AND revenue_threshold IS NOT NULL
			const data = await DB.query(sql);
			return data;
		} catch (error) {
			console.log(error);
		}
	};

	addPublisher = async (imageUrl, full_name, en_name, email, phone, address, password) => {
		try {
			// Validate required fields
			if (!imageUrl) {
				return { message: 'Image is required' };
			} else if (!full_name) {
				return { message: 'Name is required' };
			} else if (!en_name) {
				return { message: 'English Name is required' };
			} else if (!email) {
				return { message: 'Email is required' };
			} else if (!phone) {
				return { message: 'Phone Number is required' };
			} else if (!address) {
				return { message: 'Address is required' };
			} else if (!password) {
				return { message: 'Password is required' };
			}

			// Execute SQL query to insert data into the database
			const sql = `INSERT INTO ${this.tableName} (imageUrl, full_name, en_Name, email, phone, address, pass_hash) VALUES (?, ?, ?, ?, ?, ?, ?)`;
			const data = await DB.query(sql, [
				imageUrl,
				full_name,
				en_name,
				email,
				phone,
				address,
				password,
			]);

			// Return the result
			return { data, message: 'Data inserted successfuly', statusCode: 201 };
		} catch (error) {
			// Handle errors
			console.log(error);
			return { message: 'An error occurred while adding the publisher' };
		}
	};

	getPublisherDetails = async (id, full_name, en_name, email, address, phone, imageUrl) => {
		try {
			const sql2 = `UPDATE ${this.tableName} SET full_name=?, en_name=?, email=?, address=?, phone=?, imageUrl=? WHERE id=?;`;
			const data = await DB.query(sql2, [full_name, en_name, email, address, phone, imageUrl, id]);

			// const data = await DB.query(sql2, [id,full_name,en_name,email,address,phone]);

			// Return the result
			return { data, message: 'Data updated successfuly', statusCode: 200 };
		} catch (error) {
			// Handle errors
			console.log(error);
			return { message: 'An error occurred while adding the publisher' };
		}
	};

	getPublisherRequests = async status => {
		try {
			const pendingQuery = `
				SELECT * FROM publisher_portal_requests WHERE approved = 0 ORDER BY created_at DESC
			`;
			const approvedQuery = `
				SELECT pr.*, bp.full_name AS publisher_name
				FROM publisher_portal_requests pr
				JOIN publisher_users pu
				ON pr.id = pu.request_id
				JOIN book_publishers bp
				ON pu.publisher_id = bp.id
				WHERE pr.approved = 1
				ORDER BY pr.created_at DESC
			`;
			const adminApprovedQuery = `SELECT *, 1 as approved FROM publisher_users WHERE role = 'admin' ORDER BY created_at DESC`;
			const result = await DB.query(status === 'pending' ? pendingQuery : approvedQuery);
			const adminResult = await DB.query(adminApprovedQuery);
			if (status === 'approved') {
				return [...result, ...adminResult];
			}
			return result;
		} catch (err) {
			console.error(err);
			throw err;
		}
	};

	acceptPublisherRequest = async bodyJson => {
		try {
			const { id, full_name, email, phone, address, pass_hash, publisherId, designation } =
				bodyJson;
			const approveQuery = `UPDATE publisher_portal_requests SET approved = 1 WHERE id = ?`;
			const createPublisherQuery = `
				INSERT INTO publisher_users (full_name, phone, email, address, pass_hash, ${publisherId === 'admin' ? 'role' : 'publisher_id'}, request_id, designation)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`;
			const approveResult = await DB.query(approveQuery, [id]);
			if (approveResult.changedRows === 1) {
				const createPublisherResult = await DB.query(createPublisherQuery, [
					full_name,
					phone,
					email,
					address,
					pass_hash,
					publisherId === 'admin' ? publisherId : Number(publisherId),
					id,
					designation,
				]);
				return {
					success: true,
					message: 'Publisher request accepted',
				};
			}
			return {
				success: false,
				message: 'Publisher request could not accept',
			};
		} catch (err) {
			console.error(err);
			throw err;
		}
	};
}

export default new PublisherModel();
