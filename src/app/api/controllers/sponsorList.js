import SponsorModel from '../models/sponsor-request';

class SponsorController {
    async getSponsor(page,limit) {
        try {
            const results = await SponsorModel.SponsorList(page,limit);
            return results;
        } catch (err) {
            throw err;
        }
    }

    async updateSponsor(id, deleted,checked) {
        try {
            const results = await SponsorModel.updateSponsor(id, deleted,checked);
            return results;
        } catch (err) {
            throw err;
        }
    }
}

export default new SponsorController();
