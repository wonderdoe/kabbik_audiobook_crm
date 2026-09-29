
import CategotyModel from '../models/category-model'
export const dynamic = 'force-dynamic';

class CategotyController {
    async categotyUpdate(id,name,thumb_path) {
        try {
            const results = await CategotyModel.categotyUpdate(id,name,thumb_path); 
             return  { message: 'Data Updated Successfully', statusCode: 200 }; 
           
        } catch (error) {
            return { message: error, statusCode: 500 };
           
        }
    }

    
    async categotyAdd(name,thumb_path,priority) {
        try {
            const results = await CategotyModel.categotyAdd(name,thumb_path,priority); 
            // return  results 

              return  { message: 'Data Inserted Successfully', statusCode: 200 }; 
           
        } catch (error) {
            return { message: error, statusCode: 500 };
           
        }
    }

    // categotyDelete

    async categoryDelete(id) {
        try {
            const results = await CategotyModel.categoryDelete(id); 
            //  return  results 

              return  { message: 'Data Deleted Successfully', statusCode: 200 }; 
           
        } catch (error) {
            return { message: error, statusCode: 500 };
           
        }
    }

    

    async priorityUpdate(id,priority) {
        try {
            const results = await CategotyModel.priorityUpdate(id,priority); 
            if (results.affectedRows > 0) {
				return  { message: 'Data Updated Successfully', statusCode: 200 }; 
			} else {
				return  
			}

              
           
        } catch (error) {
            return { message: error, statusCode: 500 };
           
        }
    }
}

export default new CategotyController;

// module.exports = new RoleController();
