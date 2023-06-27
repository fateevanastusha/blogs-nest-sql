import { BlogModel, BannedUserInfo, CreateBlogModel } from "../../public/blogs/blogs.schema";
import { BlogDto } from "../../public/blogs/blogs.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class BloggersRepository {
  constructor(@InjectDataSource() protected dataSource : DataSource) {
  }
  async getBlogsCount(searchNameTerm: string, userId : number): Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) AS "total"
        FROM public."Blogs"
        WHERE "name" LIKE '%${searchNameTerm}%' AND "isBanned" = false AND "userId"=${userId}
    `)
    return +(count[0].total)
  }
  async getBlog(id : number) : Promise<BlogModel | null>{
    return this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
    FROM public."Blogs"
    WHERE id = '${id}' AND "isBanned"=false
    `)
  }
  async getFullBlog(id : number) : Promise<BlogModel[]>{
    return this.dataSource.query(`
    SELECT *
    FROM public."Blogs"
    WHERE id = '${id}'
    `)
  }
  async deleteBlog(id : number) : Promise<boolean>{
    await this.dataSource.query(`
    DELETE FROM public."Blogs"
        WHERE id = ${id};
    `)
    return true
  }
  async createBlog(newBlog: CreateBlogModel) : Promise<BlogModel | null>{
    this.dataSource.query(`
    INSERT INTO public."Blogs"(
    "name", "description", "websiteUrl", "createdAt", "userId", "userLogin")
    VALUES ('${newBlog.name}', '${newBlog.description}', '${newBlog.websiteUrl}', '${newBlog.createdAt}', '${Number(newBlog.userId)}', '${newBlog.userLogin}');
    `)
    const createdBlog = await this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
    FROM public."Blogs"
    WHERE createdAt = '${newBlog.createdAt}'
    `)
    if(createdBlog) return createdBlog;
    return null;
  }
  async updateBlog(blog : BlogDto, id: number) : Promise<boolean>{
    await this.dataSource.query(`
    UPDATE public."Blogs"
        SET name='${blog.name}', description='${blog.description}', "websiteUrl"='${blog.websiteUrl}'
        WHERE "id" = ${id};`)
    return true
  }
  async deleteAllData(){
    this.dataSource.query(`
    DELETE FROM public."Blogs"
    `)
    return true
  }
}