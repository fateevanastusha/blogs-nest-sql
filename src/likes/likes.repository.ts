import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LikeDocument, LikeModel } from "./likes.schema";

export class LikesRepository {
  constructor(@InjectModel('likes') private likesModel : Model<LikeDocument> ) {}

  async createNewStatus(status : LikeModel) : Promise<boolean> {
    await this.likesModel.insertMany(status)
    const createdStatus = await this.findStatus(status.postOrCommentId, status.userId)
    if (createdStatus){
      return true
    } else {
      return false
    }
  }
  async findStatus(postOrCommentId : string, userId : string) : Promise<LikeModel | null> {
    return await this.likesModel.findOne({postOrCommentId : postOrCommentId, userId : userId})
  }
  async deleteStatus(commentId : string, userId : string) : Promise<boolean> {
    const result = await this.likesModel.deleteOne({postOrCommentId : commentId, userId : userId})
    return result.deletedCount === 1
  }
  async updateStatus(status : LikeModel) : Promise<boolean> {
    const result = await this.likesModel.updateOne({postOrCommentId : status.postOrCommentId, userId : status.userId}, {
      $set: {
        status : status.status,
        userId : status.userId,
        postOrCommentId : status.postOrCommentId,
        createdAt : status.createdAt
      }
    })
    return result.matchedCount === 1
  }
  async getLikesById(commentId: string) : Promise<LikeModel[]>{
    return await this.likesModel.find({postOrCommentId : commentId, status : "Like"}, {_id: 0, __v: 0}).lean()
  }
  async findLikes(commentId: string) : Promise<number>{
    return await this.likesModel.countDocuments({postOrCommentId : commentId, status : "Like"})
  }
  async findDislikes(commentId: string) : Promise<number>{
    return await this.likesModel.countDocuments({postOrCommentId : commentId, status : "Dislike"})
  }
  async deleteAllData(){
    await this.likesModel.deleteMany({})
    return []
  }
  async getAllLikes() : Promise <LikeModel[]>{
    return await this.likesModel.find({}).lean()
  }
}