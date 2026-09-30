import DB from '../../../server/config/db.js';

class ProductOrderModel {
	getProductOrders = async () => {
		const query = `
			SELECT so.id, so.user_id, sl.name AS user_name, phone, st.name AS product_name, so.order_id, store_item, delivery_status, address
			FROM store_order AS so
			JOIN store_log AS sl ON sl.product_id = so.order_id
			JOIN store AS st ON so.product_id = st.id
			WHERE sl.is_succeed = 1
		`;
		try {
			const response = await DB.query(query);
			return response;
		} catch (err) {
			console.error(err);
			return err;
		}
	};

	updateDeliveryStatus = async body => {
		const { newDeliveryStatus, productId } = body;
		const query = `
			UPDATE store_log
			SET delivery_status = ?
			WHERE product_id = ? AND is_succeed = 1
		`;
		try {
			const response = await DB.query(query, [newDeliveryStatus, productId]);
			if (response.changedRows === 1) return { message: 'Delivery status updated', status: 200 };
			return { message: 'Could not be updated', status: 500 };
		} catch (err) {
			console.error(err);
			return err;
		}
	};
}

export default new ProductOrderModel();
