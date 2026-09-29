

import TrackUserSignUpModel from '../models/track-user-sign-up-model'
class TrackUserSignUpController {
    async getList(startDate,endDate) {
        try {
            const data = await TrackUserSignUpModel.getList(startDate,endDate); 
            if (data) {
                return {data, message:"Data Retrived Successfully",statusCode:200}  
            }
           
           
        } catch (error) {
            return error
           
        }
    }

    async getLastSevenDaysList(){
        try {
            const data = await TrackUserSignUpModel.getLastSevenDaysList(); 
            if (data) {
                return data
            }
           
           
        } catch (error) {
            return error
           
        }
    }
}

export default new TrackUserSignUpController;

// module.exports = new RoleController();
