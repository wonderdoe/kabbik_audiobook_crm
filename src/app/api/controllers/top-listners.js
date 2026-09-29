import TopListnerModel from '../models/top-listner-model';

class TopListnerController {
    async getTopListners(startDate,endDate,limit,promo_code) {
        try {
            const results = await TopListnerModel.getTopListners(startDate,endDate,limit,promo_code);
            return results;
        } catch (error) {
            return error;
        }
    }

    
}

export default new TopListnerController();

// module.exports = new RoleController();
