import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogBanInfo, BlogDocument, BlogModel, BlogOwnerModel } from "../../public/blogs/blogs.schema";

export class BlogsSuperAdminRepository {
  constructor(@InjectModel('bloggers') private blogsModel: Model<BlogDocument> ) {
  }
  async getBlogsCount(searchNameTerm: string): Promise<number>{
    return this.blogsModel.countDocuments({name: {$regex: searchNameTerm, $options : 'i'}, 'banInfo.isBanned' : false})
  }
  async getBlog(blogId : string) : Promise<BlogModel | null>{
    return await this.blogsModel.findOne({id : blogId})
  }
  async banBlog(blogId : string, status : BlogBanInfo) : Promise<boolean>{
    const result = await this.blogsModel.updateOne({id : blogId}, {$set : {'banInfo.isBanned' : status.isBanned, 'banInfo.banDate' : status.banDate}})
    return result.matchedCount === 1
  }
  async bindUser(blogId : string, userInfo : BlogOwnerModel) : Promise <boolean>{
    const result = await this.blogsModel.updateOne({id: blogId}, { $set: { blogOwnerInfo : userInfo }})
    return result.matchedCount === 1
  }
  async deleteAllData(){
    await this.blogsModel.deleteMany({})
    return []
  }
}