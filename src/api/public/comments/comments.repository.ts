import { Injectable } from "@nestjs/common";
import { CommentModel, CreateCommentModel } from "./comments.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource : DataSource) {}
  async getCommentById(id: string): Promise<CommentModel | null> {
    const comment = await this.dataSource.query(`
    SELECT *
        FROM public."Comments"
        WHERE "id" = ${id}
    `)
    if (comment.length === 0) return null
    return comment[0]
  }
  async getCommentsCountByBlogOwnerId(userId : string) : Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) as "total"
      FROM public."Comments"
      WHERE "blogOwnerId" = ${userId}
    `)
    return +count[0].total
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
  async createNewComment(comment: CreateCommentModel): Promise<CommentModel | null> {
    await this.dataSource.query(`
    INSERT INTO public."Comments"(
        "content","blogOwnerId", "blogId", "postId", "blogName", "userId", "userLogin", "createdAt")
        VALUES ('${comment.content}', ${comment.blogOwnerId}, ${comment.blogId}, ${comment.postId}, '${comment.blogName}', ${comment.userId}, '${comment.userLogin}', '${comment.createdAt}');
    `)
    const createdComment = await this.dataSource.query(`
        SELECT *
          FROM public."Comments"
          WHERE "createdAt" = '${comment.createdAt}'
    `)
    if (createdComment.length === 0) return null
    return createdComment[0]
  }
  async countCommentsByPostId(postId: string): Promise<number> {
    const count = await this.dataSource.query(`
    SELECT COUNT(*) as "total"
      FROM public."Comments"
      WHERE "postId" = ${postId}
    `)
    return +count[0].total
  }
  async deleteAllData() {
    this.dataSource.query(`
    DELETE FROM public."Comments"
    `)
    return true
  }
}