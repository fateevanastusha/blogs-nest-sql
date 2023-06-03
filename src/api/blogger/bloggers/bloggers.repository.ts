import { BlogModel, BlogDocument } from "../../public/blogs/blogs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogDto } from "../../public/blogs/blogs.dto";

export class BloggersRepository {
  constructor(@InjectModel('bloggers') private blogsModel: Model<BlogDocument> ) {
  }
  async getBlogsCount(searchNameTerm: string, userId : string): Promise<number>{
    return this.blogsModel.countDocuments({name: {$regex: searchNameTerm, $options : 'i'}, 'blogOwnerInfo.userId' : userId})
  }
  async getBlog(id : string) : Promise<BlogModel | null>{
    return this.blogsModel.findOne({id: id}, {_id: 0, __v: 0, blogOwnerInfo : 0})
  }
  async getFullBlog(id : string) : Promise<BlogModel | null>{
    return this.blogsModel.findOne({id: id})
  }
  async deleteBlog(id : string) : Promise<boolean>{
    const status = await this.blogsModel.deleteOne({id : id})
    return status.deletedCount === 1
  }
  async createBlog(newBlog: BlogModel) : Promise<BlogModel | null>{
    await this.blogsModel.insertMany(newBlog);
    const createdBlog = await this.getBlog(newBlog.id);
    if(createdBlog) return createdBlog;
    return null;
  }
  //PUT - update
  async updateBlog(blog : BlogDto, id: string) : Promise <boolean>{
    const result = await this.blogsModel.updateOne({id: id}, { $set: blog})
    return result.matchedCount === 1
  }
  async deleteAllData(){
    await this.blogsModel.deleteMany({})
    return []
  }
}