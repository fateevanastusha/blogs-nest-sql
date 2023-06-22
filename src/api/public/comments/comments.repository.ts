import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CommentDocument, CommentModel } from "./comments.schema";
import { Model } from "mongoose";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel('comments') private commentsModel : Model<CommentDocument>,
              @InjectDataSource() protected dataSource : DataSource) {}
  async getCommentById(id: string): Promise<CommentModel | null> {
    return await this.dataSource.query(`
    SELECT "id", "content", "createdAt", "blogName", "userId", "userLogin"
        FROM public."Comments"
        WHERE "id" = ${id}
    `)
  }
  async getCommentsCountByBlogOwnerId(userId : string) : Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) as "total"
      FROM public."Comments"
      WHERE "blogOwnerId" = ${userId}
    `)
    return count.total
  }
  async deleteCommentById(id: string): Promise<boolean> {
    await this.dataSource.query(`
      DELETE FROM public."Comments"
         WHERE "id" = ${id};
    `)
    return true
  }
  async updateCommentById(content: string, id: string): Promise<boolean> {
    await this.dataSource.query(`
    UPDATE public."Comments"
      SET "content"='${content}'
      WHERE "id" = ${id};
    `)
    return true
  }
  async createNewComment(comment: CommentModel): Promise<CommentModel | null> {
    await this.dataSource.query(`
    INSERT INTO public."Comments"(
        "content","blogOwnerId", "blogId", "postId", "blogName", "userId", "userLogin")
        VALUES ('${comment.content}', ${comment.blogOwnerId}, ${comment.blogId}, ${comment.postId}, '${comment.blogName}', ${comment.userId}, '${comment.userLogin}');
    `)
    const createdComment = await this.getCommentById(comment.id)
    if (createdComment)return createdComment
    return null
  }
  async countCommentsByPostId(postId: string): Promise<number> {
    const count = await this.dataSource.query(`
    SELECT COUNT(*) as "total"
      FROM public."Comments"
      WHERE "postId" = ${postId}
    `)
    return count.total
  }
  async deleteAllData() {
    this.dataSource.query(`
    DELETE FROM public."Comments"
    `)
    return true
  }
}