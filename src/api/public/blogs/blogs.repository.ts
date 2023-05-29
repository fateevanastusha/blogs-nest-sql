import { BlogDocument, BlogModel } from "./blogs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogDto } from "./blogs.dto";

export class BlogsRepository{
  constructor(@InjectModel('bloggers') private blogsModel: Model<BlogDocument> ) {
  }
  async getBlogsCount(searchNameTerm: string): Promise<number>{
    return this.blogsModel.countDocuments({name: {$regex: searchNameTerm, $options : 'i'}})
  }
  async getBlog(id : string) : Promise<BlogModel | null>{
    return this.blogsModel.findOne({id: id}, {_id: 0, __v: 0})
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
