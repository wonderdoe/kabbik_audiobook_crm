
export const dynamic = 'force-dynamic';


import ArtistModel from '../models/artists-controller'
class ArtistController {
    async getArtists() {
        try {
            const results = await ArtistModel.getArtists(); 
             return results  
           
        } catch (error) {
            return error
           
        }
    }
}

export default new ArtistController;

// module.exports = new RoleController();
