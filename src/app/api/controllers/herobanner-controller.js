import HeroBannerModel from '../models/herobanner-model';
class HeroBannerController {
	async getBannerList(offset, limit) {
		try {
			const results = await HeroBannerModel.bannerList(offset, limit);
			return results;
		} catch (error) {
			return error;
		}
	}

	async uploadBannerImg(id, image_url) {	
		try {
			const results = await HeroBannerModel.uploadBannerImg(id, image_url);
			return { message: 'Data Updated Successfully',statusCode: 200};
		} catch (error) {
			return error;
		}
	}

    async deleteBanner(id){
        try {
			const results = await HeroBannerModel.deleteBannerModel(id);
			return { message: 'Data Deleted Successfully',statusCode: 200};
		} catch (error) {
			return error;
		}
    }
	 async addHeroBannerList(image_url, title,audiobook_id ){
        try {
			const results = await HeroBannerModel.addHeroBannerList(image_url, title,audiobook_id);
			return { message: 'Data Created Successfully',statusCode: 201}
		} catch (error) {
			return error;
		}
    }
	

	async toggleHeroBanner(audiobook_id, status){
        try {
			const results = await HeroBannerModel.toggleHeroBanner(audiobook_id, status);
			return results
		} catch (error) {
			return error;
		}
    }
}

export default new HeroBannerController();

// module.exports = new RoleController();
