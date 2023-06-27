import { LikeModel, LikeViewModel } from "./likes.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { LikesInfo } from "../api/public/comments/comments.schema";

export class LikesRepository {
  constructor(@InjectDataSource() protected dataSource : DataSource) {}
  async getLikesInfoWithUser(userId: number, postOrCommentId : number) : Promise<LikesInfo>{
    return await this.dataSource.query(`
    SELECT
      (SELECT COALESCE(COUNT(*), 0)::integer
       FROM public."Likes"
       WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Like') AS "likesCount",
      
      (SELECT COALESCE(COUNT(*), 0)::integer
       FROM public."Likes"
       WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Dislike') AS "dislikesCount",
      
      COALESCE((SELECT "status"::text
            FROM public."Likes"
            WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "userId" = ${userId}), 'None') AS "myStatus";
    `)

  }

  async getLikesInfo(postOrCommentId : number) : Promise<LikesInfo>{
    return await this.dataSource.query(`
    SELECT 
    
    (SELECT COALESCE(COUNT(*), 0)::integer
       FROM public."Likes"
       WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Like') AS "likesCount",
      
    (SELECT COALESCE(COUNT(*), 0)::integer
       FROM public."Likes"
       WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Dislike') AS "dislikesCount",
      
    (SELECT COALESCE(status, 'None')::text
       FROM public."Likes") AS "myStatus";
    `)
  }
  async getLastLikes(postOrCommentId : number) : Promise<LikeViewModel[]>{
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
  async findStatus(postOrCommentId : number, userId : number) : Promise<LikeModel | null> {
    return await this.dataSource.query(`
    SELECT *
        FROM public."Likes"
        WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "userId" = ${userId}
    `)
  }
  async deleteStatus(commentId : number, userId : number) : Promise<boolean> {
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