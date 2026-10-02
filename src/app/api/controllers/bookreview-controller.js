
import ReviewModel from '../models/bookreview-model'
class ReviewController {
    async getReview(offset, limit, search) {
        try {
            const results = await ReviewModel.reviewList(offset, limit, search); 
             return results  
           
        } catch (error) {
            console.error(error);
            return { data: [], total: 0 };
        }
    }

    async deleteReview(id) {
        try {
            const result = await ReviewModel.deleteReview(id);
            if (!result?.deleted) {
                return {
                    success: false,
                    message: 'Review not found',
                    statusCode: 404,
                };
            }
            return {
                success: true,
                message: 'Review deleted',
                statusCode: 200,
            };
        } catch (error) {
            return {
                success: false,
                message: error?.message || 'Failed to delete review',
                statusCode: 500,
            };
        }
    }
}

export default new ReviewController;

// module.exports = new RoleController();
