import { BlogBanInfo, BlogModel, BlogOwnerModel } from "../../public/blogs/blogs.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class BlogsSuperAdminRepository {
  constructor(@InjectDataSource() protected dataSource : DataSource) {
  }
  async getBlogsCount(searchNameTerm: string): Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*) AS "total"
        FROM public."Blogs"
        WHERE "name" LIKE '%${searchNameTerm}%' AND "isBanned" = false
    `)
    return count.total
  }
  async getBlog(blogId : string) : Promise<BlogModel | null>{
    return await this.dataSource.query(`
    SELECT *
        FROM public."Blogs"
        WHERE "id" = ${blogId} 
    `)
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
  async deleteAllData(){
    await this.dataSource.query(`DELETE FROM public."Blogs"`)
    return true
  }
}