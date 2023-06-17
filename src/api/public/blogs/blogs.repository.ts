import { BlogDocument, BlogModel } from "./blogs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

export class BlogsRepository{
  constructor(@InjectModel('bloggers') private blogsModel: Model<BlogDocument> ) {
  }
  async getBlogsCount(searchNameTerm: string): Promise<number>{
    return this.blogsModel.countDocuments({name: {$regex: searchNameTerm, $options : 'i'}, isBanned : false})
  }
  async getBlog(id : string) : Promise<BlogModel | null>{
    return this.blogsModel.findOne({id: id, isBanned : false}, {_id: 0, __v: 0, blogOwnerInfo : 0, bannedUsers : 0, isBanned : 0})
  }
  async getFullBlog(id : string) : Promise<BlogModel | null>{
    return this.blogsModel.findOne({id: id})
  }
  async createBlog(newBlog: BlogModel) : Promise<BlogModel | null>{
    await this.blogsModel.insertMany(newBlog);
    const createdBlog = await this.getBlog(newBlog.id);
    if(createdBlog) return createdBlog;
    return null;
  }
  async deleteAllData(){
    await this.blogsModel.deleteMany({})
    return []
  }
}
