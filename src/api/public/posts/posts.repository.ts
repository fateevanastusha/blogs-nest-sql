import { PostModel } from "./posts.schema";
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
  async getPost(id: string) : Promise<PostModel | null>{
    return this.dataSource.query(`
    SELECT "id", "title", "shortDescription", "content", "blogName", "createdAt", "blogId"
        FROM public."Posts"
        WHERE "id"=${id}
    `)
  }
  async deletePost(id:string) : Promise<boolean>{
    await this.dataSource.query(`
    DELETE FROM public."Posts"
        WHERE "id"=${id};
    `)
    return true
  }
  async createPost(newPost: PostModel) : Promise <PostModel | null>{
    await this.dataSource.query(`
    INSERT INTO public."Posts"(
        "title", "shortDescription", "content", "blogName", "createdAt", "blogId")
        VALUES ('${newPost.title}','${newPost.shortDescription}','${newPost.content}','${newPost.blogName}', '${newPost.createdAt}', ${newPost.blogId});
    `)
    return this.getPost(newPost.id)
  }
  async updatePost(post : PostsDto, postId : string) : Promise <boolean>{
    await this.dataSource.query(`
    UPDATE public."Posts"
      SET "title"='${post.title}', "shortDescription"='${post.shortDescription}', "content"='${post.content}'
      WHERE "id"=${postId};
    `)
    return true
  }
  async countPostsByBlogId(blogId : string) : Promise<number>{
    const count = await this.dataSource.query(`
      SELECT COUNT(*) AS "total"
        FROM public."Posts"
        WHERE "blogId"=${blogId}
    `)
    return count.total
  }
  async deleteAllData() {
    this.dataSource.query(`
    DELETE FROM public."Posts"
    `)
    return true
  }
}