import rewardsModel from '../models/rewards.model';

class RewardsController {
	async getClaims(params) {
		return rewardsModel.getRewardClaims(params);
	}

	async getSummary(params) {
		return rewardsModel.getRewardSummary(params);
	}

	async getClaimById(id) {
		return rewardsModel.getRewardClaimById(id);
	}

	async getFilterOptions() {
		return rewardsModel.getFilterOptions();
	}

	async updateClaimStatus(id, claimStatus) {
		return rewardsModel.updateClaimStatus(id, claimStatus);
	}
}

export default new RewardsController();
