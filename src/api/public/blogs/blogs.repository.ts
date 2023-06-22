import { BlogDocument, BlogModel } from "./blogs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class BlogsRepository{
  constructor(@InjectModel('bloggers') private blogsModel: Model<BlogDocument>,
              @InjectDataSource() protected dataSource : DataSource) {
  }
  async getBlogsCount(searchNameTerm: string): Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) AS "total"
        FROM public."Blogs"
        WHERE "name" LIKE '%${searchNameTerm}%' AND "isBanned" = false
    `)
    return count.total
  }
  async getBlog(id : string) : Promise<BlogModel | null>{
    return this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
    FROM public."Blogs"
    WHERE id = '${id}'
    `)
  }
  async getFullBlog(id : string) : Promise<BlogModel | null>{
    return this.dataSource.query(`
    SELECT *
    FROM public."Blogs"
    WHERE id = '${id}'
    `)
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
  async deleteAllData(){
    this.dataSource.query(`
    DELETE FROM public."Blogs"
    `)
    return true
  }
}
