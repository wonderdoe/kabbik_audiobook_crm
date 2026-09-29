import ProductOrderModel from '../models/product-order-model';

class ProductOrderController {
	getProductOrders = async () => {
		try {
			const data = await ProductOrderModel.getProductOrders();
			return data;
		} catch (err) {
			console.error(err);
			return err;
		}
	};

	updateDeliveryStatus = async body => {
		try {
			const data = await ProductOrderModel.updateDeliveryStatus(body);
			return data;
		} catch (err) {
			console.error(err);
			return err;
		}
	};
}

export default new ProductOrderController();
