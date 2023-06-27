import { BlogModel, CreateBlogModel } from "./blogs.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class BlogsRepository{
  constructor(@InjectDataSource() protected dataSource : DataSource) {
  }
  async getBlogsCount(searchNameTerm: string): Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) AS "total"
    FROM public."Blogs"
    WHERE "name" LIKE '%' || CASE WHEN '${searchNameTerm}' = '' THEN '' ELSE '${searchNameTerm}' END || '%'
    AND "isBanned" = false
    `)
    return +(count[0].total)
  }
  async getBlog(id : number) : Promise<BlogModel | null>{
    return this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
    FROM public."Blogs"
    WHERE id = ${id}
    `)
  }
  async getFullBlog(id : number) : Promise<BlogModel[]>{
    return this.dataSource.query(`
    SELECT *
    FROM public."Blogs"
    WHERE id = '${id}'
    `)
  }
  async createBlog(newBlog: CreateBlogModel) : Promise<BlogModel | null>{
    await this.dataSource.query(`
    INSERT INTO public."Blogs"(
    "name", "description", "websiteUrl", "createdAt", "userId", "userLogin")
    VALUES ('${newBlog.name}', '${newBlog.description}', '${newBlog.websiteUrl}', '${newBlog.createdAt}', ${newBlog.userId}, '${newBlog.userLogin}');
    `)
    return (await this.dataSource.query(`
      SELECT "createdAt", "description", "id", "isMembership", "name", "websiteUrl"
      FROM public."Blogs"
      WHERE "createdAt" = '${newBlog.createdAt}'
    `))[0]
  }
  async deleteAllData(){
    this.dataSource.query(`
    DELETE FROM public."Blogs"
    `)
    return true
  }
}
