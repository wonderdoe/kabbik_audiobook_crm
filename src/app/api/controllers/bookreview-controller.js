
import ReviewModel from '../models/bookreview-model'
class ReviewController {
    async getReview(offset,limit) {
        try {
            const results = await ReviewModel.reviewList(offset,limit); 
             return results  
           
        } catch (error) {
            return error
           
        }
    }
}

export default new ReviewController;

// module.exports = new RoleController();
