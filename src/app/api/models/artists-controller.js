import DB from '../../../server/config/db';

export const dynamic = 'force-dynamic';

class ArtistModel {
	getArtists = async () => {
		try {
			const sql = `SELECT DISTINCT * FROM cast_crew`;
			const sqlRresponse = await DB.query(sql);
			return sqlRresponse;
		} catch (error) {
			console.log(error);
		}
	};
}

export default new ArtistModel();
