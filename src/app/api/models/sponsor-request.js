import DB from '../../../server/config/db';

class SponsorModel {
    tableName = 'sponsor_request';

    SponsorList = async (page=1,limit=20) => {
        try {
            console.log("from model")
            const offset = (page - 1) * limit;

            const sql = `
            SELECT *
            FROM ${this.tableName}
            WHERE deleted = 0
            order by created_at desc
           
            `;
            //  LIMIT ? OFFSET ?;
            // const sql = `SELECT * FROM ${this.tableName} where deleted = 0  `;
            const sqlRresponse = await DB.query(sql,limit,offset);
            return sqlRresponse;
        } catch (error) {
            console.log(error);
        }
    };
    


    updateSponsor = async (id, deleted=0,checked=0) => {
        try {
            const sql = `UPDATE  ${this.tableName} SET deleted = ? , checked =? WHERE id = ?;`;
            const data = await DB.query(sql, [deleted,checked, id]);

            
            return data;
        } catch (error) {
            
            throw error;
        }
    };

    
}

export default new SponsorModel();
