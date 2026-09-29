
import authorModel from '../models/author.model';

export const dynamic = 'force-dynamic';

class AuthorController {
    async getAuthor(offset, limit) {
        try {
            const results = await authorModel.getAuthor(offset, limit); 
            results.date= new Date().toISOString(); // Adding a date field to the results
             return results  
           
        } catch (error) {
            return error
           
        }
    }

    async getAuthorList() {
        try {
            const results = await authorModel.getAuthorList(); 
             return results  
           
        } catch (error) {
            return error
           
        }
    }

    async addAuthor(name,description,imageUrl,en_name) {
        try {
            const results = await authorModel.addAuthor(name,description,imageUrl,en_name); 
            return {results,  message: 'Data Updated Successfully',statusCode: 201,  }; 
           
        } catch (error) {
            return error
           
        }
    }

   

    async editAuthor(name, description, imageUrl, en_name,id) {
      
        try {
            const results = await authorModel.editAuthor(name, description, imageUrl, en_name,id); 
             return {results,  message: 'Data Updated Successfully',statusCode: 201,  };  
           
        } catch (error) {
            return error
           
        }
    }
}

export default new AuthorController;

// module.exports = new RoleController();
