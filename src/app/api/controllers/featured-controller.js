// import AudioBookModel from '../models/audiobook-model';

import FeaturedModel from '../models/featured-model';

class FeaturedController {

    

    async getFeatured() {
		// name,description,author_name,price,en_name,thumb_path
		try {
			const results = await FeaturedModel.getFeatured();

			return results
		} catch (error) {
			console.error('Error in getAudioList:', error);
			throw error; // Re-throw the error to be handled by the caller
		}
	}

    
    async addFeatureBanner(audiobook_id) {
		
		
        try {
            const results = await FeaturedModel.addFeatureBanner( audiobook_id);
            return {message:"Data Inserted Successfully",statusCode:201}
        } catch (error) {
            console.error('Error in addFeatureBanner:', error);
            throw error;
        }
	}
	

	async toggleFeatureImage(audiobook_id,status) {
		
		
        try {
            const results = await FeaturedModel.toggleFeatureImage( audiobook_id,status);
            return results
        } catch (error) {
            console.error('Error in addFeatureBanner:', error);
            throw error;
        }
	}
    
    // async getPodcastList(offset,limit) {
	// 	// name,description,author_name,price,en_name,thumb_path
	// 	try {
	// 		const results = await AudioBookModel.getPodcastList(offset,limit
				
	// 		);

	// 		return results
	// 	} catch (error) {
	// 		console.error('Error in getAudioList:', error);
	// 		throw error; // Re-throw the error to be handled by the caller
	// 	}
	// }
}

export default new FeaturedController();
