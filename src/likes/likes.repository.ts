import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LikeDocument, LikeModel, LikeViewModel } from "./likes.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { LikesInfo } from "../api/public/comments/comments.schema";

export class LikesRepository {
  constructor(@InjectModel('likes') private likesModel : Model<LikeDocument>,
              @InjectDataSource() protected dataSource : DataSource) {}
  async getLikesInfoWithUser(userId: string, postOrCommentId : string) : Promise<LikesInfo>{
    return await this.dataSource.query(`
    SELECT likes."likesCount", dislikes."dislikesCount", myStatus."myStatus"
      FROM 
        (SELECT COUNT(*) AS "likesCount"
         FROM public."Likes"
         WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Like') likes,
         
        (SELECT COUNT(*) AS "dislikesCount"
         FROM public."Likes"
         WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Dislike') dislikes,
      
        (SELECT status AS "myStatus"
         FROM public."Likes"
         WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "userId" = ${userId}) myStatus;
    `)
  }

  async getLikesInfo(postOrCommentId : string) : Promise<LikesInfo>{
    return await this.dataSource.query(`
    SELECT likes."likesCount", dislikes."dislikesCount", myStatus."myStatus"
      FROM 
        (SELECT COUNT(*) AS "likesCount"
         FROM public."Likes"
         WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Like') likes,
         
        (SELECT COUNT(*) AS "dislikesCount"
         FROM public."Likes"
         WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Dislike') dislikes,
      
        (SELECT 'None' AS "myStatus") myStatus;
    `)
  }
  async getLastLikes(postOrCommentId : string) : Promise<LikeViewModel[]>{
    return await this.dataSource.query(`
      SELECT l."createdAt" AS "addedAt", l."userId", u."login"
        FROM public."Likes" l
        JOIN public."Users" u ON l."userId" = u."id"
        WHERE l."status" = 'Like' AND (l."postId" = ${postOrCommentId} OR l."commentId" = ${postOrCommentId})
        ORDER BY l."createdAt" DESC
        LIMIT 3;
    `)
  }
  async createNewStatus(status : LikeModel) : Promise<boolean> {
    await this.dataSource.query(`
    INSERT INTO public."Likes"(
        "createdAt", "status", "userId", "postId", "commentId")
        VALUES ('
        ${status.createdAt}', 
        '${status.status}', 
        ${status.userId}, 
        ${status.postOrCommentId}, 
        ${status.postOrCommentId});
    `)
    return true
  }
  async findStatus(postOrCommentId : string, userId : string) : Promise<LikeModel | null> {
    return await this.dataSource.query(`
    SELECT *
        FROM public."Likes"
        WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "userId" = ${userId}
    `)
  }
  async deleteStatus(commentId : string, userId : string) : Promise<boolean> {
    await this.dataSource.query(`
    DELETE FROM public."Likes"
        WHERE "commentId" = ${commentId} AND "userId" = ${userId}
    `)
    return true
  }
  async updateStatus(status : LikeModel) : Promise<boolean> {
    await this.dataSource.query(`
    UPDATE public."Likes"
        SET status='${status.status}'
        WHERE ("postId" = ${status.postOrCommentId} OR "commentId" = ${status.postOrCommentId}) AND "userId" = ${status.userId};`)
    return true;
  }
  async findLikes(commentId: string) : Promise<number>{
    const count =  await this.dataSource.query(`
    SELECT COUNT(*) as "total"
        FROM public."Likes"
        WHERE ("postId" = ${commentId} OR "commentId" = ${commentId}) AND "status" = 'Like'
    `)
    return count.total
  }
  async findDislikes(commentId: string) : Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) as "total"
        FROM public."Likes"
        WHERE ("postId" = ${commentId} OR "commentId" = ${commentId}) AND "status" = 'Dislike'
    `)
    return count.total
  }
  async deleteAllData(){
    this.dataSource.query(`
    DELETE FROM public."Likes"
    `)
    return true
  }
  async getAllLikes() : Promise <LikeModel[]>{
    return await this.dataSource.query(`
    SELECT *
        FROM public."Likes"
    `)
  }
}