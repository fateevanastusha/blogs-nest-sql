import { BlogBanInfo, BlogModel, BlogOwnerModel, BlogViewModel, CreateBlogModel } from "../schemas/blogs.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogDto } from "../dto/blogs.dto";
import { NotFoundException } from '@nestjs/common';
import { BlogsEntity } from '../entities/blogs.entity';

export class BlogsRepository{
  constructor(@InjectDataSource() protected dataSource : DataSource) {}
  async createBlog(newBlog: CreateBlogModel) : Promise<BlogViewModel[]>{
    await this.dataSource.query(`
      INSERT INTO public."Blogs"("name", "description", "websiteUrl", "createdAt", "userId", "userLogin")
      VALUES ('${newBlog.name}', '${newBlog.description}', '${newBlog.websiteUrl}', '${newBlog.createdAt}', '${Number(newBlog.userId)}', '${newBlog.userLogin}');`)
    return await this.dataSource.query(`
      SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
      FROM public."Blogs"
      WHERE "createdAt" = '${newBlog.createdAt}'
    `)
  }

  private async save(entity: BlogsEntity){
    await this.dataSource.manager.save(entity);
  }
  async getFullBlog(blogId : string) : Promise<BlogModel>{
    const foundBlog = await this.dataSource.query(`
      SELECT *
      FROM public."Blogs"
      WHERE "id" = ${blogId}
    `)
    if (foundBlog.length === 0) throw new NotFoundException()
    return foundBlog[0]
  }
  async updateBlog(blog : BlogDto, id: string) : Promise<boolean>{
    await this.dataSource.query(`
    UPDATE public."Blogs"
        SET name='${blog.name}', description='${blog.description}', "websiteUrl"='${blog.websiteUrl}'
        WHERE "id" = ${id};`)
    return true
  }
  async deleteBlog(id : string) : Promise<boolean>{
    await this.dataSource.query(`
    DELETE FROM public."Blogs"
        WHERE id = ${id};
    `)
    return true
  }
  async getBlogsCount(searchNameTerm: string): Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) AS "total"
    FROM public."Blogs"
    WHERE "name" ILIKE '%' || CASE WHEN '${searchNameTerm}' = '' THEN '' ELSE '${searchNameTerm}' END || '%'
    AND "isBanned" = false
    `)
    return +(count[0].total)
  }
  async getBlogsCountWithUser(searchNameTerm: string, userId : string): Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) AS "total"
        FROM public."Blogs"
        WHERE "name" ILIKE '%' || CASE WHEN '${searchNameTerm}' = '' THEN '' ELSE '${searchNameTerm}' END || '%'
        AND "isBanned" = false 
        AND "userId"=${userId}
    `)
    return +(count[0].total)
  }
  async banBlog(blogId : string, status : BlogBanInfo) : Promise<boolean>{
    await this.dataSource.query(`
    UPDATE public."Blogs"
        SET "isBanned"=${status.isBanned}, "banDate"='${status.banDate}'
        WHERE id=${blogId}
    `)
    return true
  }
  async bindUser(blogId : string, userInfo : BlogOwnerModel) : Promise <boolean>{
    await this.dataSource.query(`
    UPDATE public."Blogs"
        SET "userId"='${userInfo.userId}', "userLogin"='${userInfo.userLogin}'
        WHERE id=${blogId}
    `)
    return true
  }
}
