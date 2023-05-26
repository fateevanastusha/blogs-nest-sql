import { PostDocument, PostModel } from "./posts.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostsDto } from "./posts.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PostsRepository {
  constructor(@InjectModel('posts') private postsModel: Model<PostDocument>) {
  }
  async getPosts() : Promise<PostModel[]>{
    return this.postsModel
      .find({}, {_id: 0, __v: 0, 'extendedLikesInfo' : {_id : 0}})
      .lean()
  }
  async getPostsCount() : Promise<number>{
    return this.postsModel.countDocuments({}, {_id: 0, __v: 0})
  }
  async getPost(id: string) : Promise<PostModel | null>{
    return this.postsModel.findOne({id : id}, {_id: 0, __v: 0, 'extendedLikesInfo' : {_id : 0}}).lean();
  }
  async deletePost(id:string) : Promise<boolean>{
    const result = await this.postsModel.deleteOne({id: id});
    return result.deletedCount === 1;
  }
  async createPost(newPost: PostModel) : Promise <PostModel | null>{
    await this.postsModel.insertMany(newPost)
    return this.getPost(newPost.id)
  }
  async updatePost(post : PostsDto, id : string) : Promise <boolean>{
    const result = await this.postsModel.updateOne({id: id}, {$set : post
    })
    return result.matchedCount === 1
  }
  async getPostsByBlogId(blogId : string) : Promise<PostModel[]>{
    return this.postsModel.find({blogId}, {projection: {_id: 0}}).lean()
  }
  async countPostsByBlogId(blogId : string) : Promise<number>{
    return this.postsModel.countDocuments({blogId}, {projection: {_id: 0}})
  }
  async changeLikesTotalCount(postId: string, likesCount: number, dislikesCount: number): Promise<boolean> {
    const status = await this.postsModel.updateOne({
      id: postId,
    }, {
      $set: {
        'extendedLikesInfo.likesCount': likesCount,
        'extendedLikesInfo.dislikesCount': dislikesCount
      }
    })
    return status.matchedCount === 1
  }
  async deleteAllData() {
    await this.postsModel.deleteMany({});
    return [];
  }
}