import BlogModel from '../models/blog-model';

class BlogController {
	getBlogs = async () => {
		try {
			const blogs = await BlogModel.getBlogs();
			return blogs;
		} catch (err) {
			console.error(err);
			throw err;
		}
	};
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new BlogController();
