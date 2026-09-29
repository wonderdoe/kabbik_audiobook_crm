
import PopupModel from '../models/popup-model'
class PopupController {
    async getPopupList() {
        try {
            const results = await PopupModel.popupList(); 
             return results  
           
        } catch (error) {
            return error
           
        }
    }

    async togglePopUp(id,bodyreq) {
        try {
            const results = await PopupModel.togglePopUp(id,bodyreq); 
             return {message:"Data Updated Successfully", statusCode:200}  
           
        } catch (error) {
            return error
           
        }
    }

    async addPopupList(home_ad_type,home_ad_image,audiobook_id){
       
        try {
            const results = await PopupModel.addPopUp(home_ad_type,home_ad_image,audiobook_id); 
             return {message:"Data Added Successfully",statusCode:201} 
           
        } catch (error) {
            return error
           
        }
    }


    async updatePopUpImage(id, image_url){

        try {
            const results = await PopupModel.updatePopUpImage(id, image_url); 
             return {results,message:"Image Updated Successfully",statusCode:200} 
           
        } catch (error) {
            return error
           
        }
    }
}

export default new PopupController;

