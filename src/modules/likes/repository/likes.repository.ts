import { LikeModel, LikeViewModel } from "../schemas/likes.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { LikesInfo } from "../../comments/schemas/comments.schema";

export class LikesRepository {
  constructor(@InjectDataSource() protected dataSource : DataSource) {}
  async getLikesInfoWithUser(userId: string, postOrCommentId : string) : Promise<LikesInfo>{
    const likes = await this.dataSource.query(`
    SELECT
      (SELECT COALESCE(COUNT(*))::integer
       FROM public."Likes"
       WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Like') AS "likesCount",
      
      (SELECT COALESCE(COUNT(*))::integer
       FROM public."Likes"
       WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "status" = 'Dislike') AS "dislikesCount",
      
      COALESCE((SELECT "status"::text
            FROM public."Likes"
            WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "userId" = ${userId}), 'None') AS "myStatus";
    `)
    return likes
  }

  async getLikesInfo(postOrCommentId : string) : Promise<LikesInfo>{
    return await this.dataSource.query(`
    SELECT 
      (SELECT COALESCE(COUNT(*))::integer
       FROM public."Likes" l
       INNER JOIN public."Users" u ON l."userId" = u."id"
       WHERE (l."postId" = ${postOrCommentId} OR l."commentId" = ${postOrCommentId}) AND l."status" = 'Like' AND u."isBanned" = false) AS "likesCount",
      
      (SELECT COALESCE(COUNT(*))::integer
       FROM public."Likes" l
       INNER JOIN public."Users" u ON l."userId" = u."id"
       WHERE (l."postId" = ${postOrCommentId} OR l."commentId" = ${postOrCommentId}) AND l."status" = 'Dislike' AND u."isBanned" = false) AS "dislikesCount",
      
      COALESCE((SELECT 'None')) AS "myStatus";
  `)
  }
  async getLastLikes(postOrCommentId : string) : Promise<LikeViewModel[]>{
    return await this.dataSource.query(`
      SELECT l."createdAt" AS "addedAt", l."userId", u."login"
        FROM public."Likes" l
        JOIN public."Users" u ON l."userId" = u."id"
        WHERE l."status" = 'Like' AND (l."postId" = ${postOrCommentId} OR l."commentId" = ${postOrCommentId}) AND u."isBanned" = false
        ORDER BY l."createdAt" DESC
        LIMIT 3;
    `)
  }
  async createNewStatusForComment(status : LikeModel) : Promise<boolean> {
    await this.dataSource.query(`
    INSERT INTO public."Likes"(
        "createdAt", "status", "userId","commentId")
        VALUES ($1, $2, $3, $4);
    `, [status.createdAt, status.status, status.userId, status.postOrCommentId])
    const findStatus = await this.dataSource.query(`
    SELECT *
        FROM public."Likes"
        WHERE "createdAt" = '${status.createdAt}'
    `)
    if (findStatus.length === 0) return false
    return true
  }
  async createNewStatusForPost(status : LikeModel) : Promise<boolean> {
    await this.dataSource.query(`
    INSERT INTO public."Likes"(
        "createdAt", "status", "userId", "postId")
        VALUES ($1, $2, $3, $4);
    `, [status.createdAt, status.status, status.userId, status.postOrCommentId])
    const findStatus = await this.dataSource.query(`
    SELECT *
        FROM public."Likes"
        WHERE "createdAt" = '${status.createdAt}'
    `)
    if (findStatus.length === 0) return false
    return true
  }
  async findStatus(postOrCommentId : string, userId : string) : Promise<LikeModel[]> {
    return await this.dataSource.query(`
    SELECT *
        FROM public."Likes"
        WHERE ("postId" = ${postOrCommentId} OR "commentId" = ${postOrCommentId}) AND "userId" = ${userId}
    `)
  }
  async updateStatus(status : LikeModel) : Promise<boolean> {
    await this.dataSource.query(`
    UPDATE public."Likes"
        SET status='${status.status}'
        WHERE ("postId" = ${status.postOrCommentId} OR "commentId" = ${status.postOrCommentId}) AND "userId" = ${status.userId};`)
    return true;
  }
  async getAllLikes() : Promise <LikeModel[]>{
    return await this.dataSource.query(`
    SELECT *
        FROM public."Likes"
    `)
  }
}