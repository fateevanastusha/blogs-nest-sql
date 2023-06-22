import { BlogModel, BlogDocument, BannedUserInfo } from "../../public/blogs/blogs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogDto } from "../../public/blogs/blogs.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class BloggersRepository {
  constructor(@InjectModel('bloggers') private blogsModel: Model<BlogDocument> ,
              @InjectDataSource() protected dataSource : DataSource) {
  }
  async getBlogsCount(searchNameTerm: string, userId : string): Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) AS "total"
        FROM public."Blogs"
        WHERE "name" LIKE '%${searchNameTerm}%' AND "isBanned" = false AND "userId"=${userId}
    `)
    return count.total
  }
  async getBlog(id : string) : Promise<BlogModel | null>{
    return this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
    FROM public."Blogs"
    WHERE id = '${id}' AND "isBanned"=false
    `)
  }
  async getFullBlog(id : string) : Promise<BlogModel | null>{
    return this.dataSource.query(`
    SELECT *
    FROM public."Blogs"
    WHERE id = '${id}'
    `)
  }
  async deleteBlog(id : string) : Promise<boolean>{
    await this.dataSource.query(`
    DELETE FROM public."Blogs"
        WHERE id = ${id};
    `)
    return true
  }
  async createBlog(newBlog: BlogModel) : Promise<BlogModel | null>{
    this.dataSource.query(`
    INSERT INTO public."Blogs"(
    "name", "description", "websiteUrl", "createdAt", "userId", "userLogin")
    VALUES ('${newBlog.name}', '${newBlog.description}', '${newBlog.websiteUrl}', '${newBlog.createdAt}', '${Number(newBlog.userId)}', '${newBlog.userLogin}');
    `)
    const createdBlog = await this.getBlog(newBlog.id);
    if(createdBlog) return createdBlog;
    return null;
  }
  async updateBlog(blog : BlogDto, id: string) : Promise <boolean>{
    await this.dataSource.query(`
    UPDATE public."Blogs"
        SET name='${blog.name}', description='${blog.description}', "websiteUrl"='${blog.websiteUrl}'
        WHERE "id" = ${id};`)
    return true
  }
  //ЗАМЕНИТЬ НА АЙДИШНИК
  async updateBlogBannedUsers(blogId : string, bannedUsers : BannedUserInfo[] ) : Promise <boolean>{
    await this.dataSource.query(`
    UPDATE public."Blogs"
        SET bannedUsers=ARRAY_APPEND("bannedUsers", ${bannedUsers})
        WHERE "id" = ${blogId};`)
    return true
  }
  async deleteAllData(){
    this.dataSource.query(`
    DELETE FROM public."Blogs"
    `)
    return true
  }
}