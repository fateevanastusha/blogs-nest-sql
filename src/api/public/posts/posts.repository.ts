import { CreatePostModel, PostModel } from "./posts.schema";
import { PostsDto } from "./posts.dto";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource : DataSource) {
  }
  async getPosts() : Promise<PostModel[]>{
    return this.dataSource.query(`
    SELECT "id", "title", "shortDescription", "content", "blogName", "createdAt", "blogId"
        FROM public."Posts";
    `)
  }
  async getPost(id: number) : Promise<PostModel[]>{
    return this.dataSource.query(`
    SELECT "id", "title", "shortDescription", "content", "blogName", "createdAt", "blogId"
        FROM public."Posts"
        WHERE "id"=${id}
    `)
  }
  async deletePost(id:number) : Promise<boolean>{
    await this.dataSource.query(`
    DELETE 
        FROM public."Likes" l 
        USING public."Comments" c
        WHERE c."postId" = ${id} AND l."commentId" = c."id";
    DELETE FROM public."Likes"
        WHERE "postId"=${id};
    DELETE FROM public."Comments"
        WHERE "postId"=${id};
    DELETE FROM public."Posts"
        WHERE "id"=${id};
    `)
    return true
  }
  async createPost(newPost: CreatePostModel) : Promise <PostModel | null>{
    await this.dataSource.query(`
    INSERT INTO public."Posts"(
        "title", "shortDescription", "content", "blogName", "createdAt", "blogId")
        VALUES ('${newPost.title}','${newPost.shortDescription}','${newPost.content}','${newPost.blogName}', '${newPost.createdAt}', ${newPost.blogId});
    `)
    return (await this.dataSource.query(`
    SELECT *
        FROM public."Posts"
        WHERE "createdAt"='${newPost.createdAt}'
    `))[0]
  }
  async updatePost(post : PostsDto, postId : number) : Promise <boolean>{
    await this.dataSource.query(`
    UPDATE public."Posts"
      SET "title"='${post.title}', "shortDescription"='${post.shortDescription}', "content"='${post.content}'
      WHERE "id"=${postId};
    `)
    return true
  }
  async countPostsByBlogId(blogId : number) : Promise<number>{
    const count = await this.dataSource.query(`
      SELECT COUNT(*) AS "total"
        FROM public."Posts"
        WHERE "blogId"=${blogId}
    `)
    return +(count[0].total)
  }
  async deleteAllData() {
    this.dataSource.query(`
    DELETE FROM public."Posts"
    `)
    return true
  }
}