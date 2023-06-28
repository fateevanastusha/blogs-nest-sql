import { BlogBanInfo, BlogModel, BlogOwnerModel } from "../../public/blogs/blogs.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class BlogsSuperAdminRepository {
  constructor(@InjectDataSource() protected dataSource : DataSource) {
  }
  async getBlogsCount(searchNameTerm: string): Promise<number>{
    let count
    if (searchNameTerm = '') {
      count = await this.dataSource.query(`
        SELECT COUNT(*) AS "total"
          FROM public."Blogs"
          WHERE "name" LIKE '%' || CASE WHEN '${searchNameTerm}' = '' THEN '' ELSE '${searchNameTerm}' END || '%'
          AND "isBanned" = false
        `)
    } else {
      count = await this.dataSource.query(`
        SELECT COUNT(*) AS "total"
          FROM public."Blogs"
          WHERE "isBanned" = false
        `)
    }
    return Number(count[0].total)
  }
  async getBlog(blogId : number) : Promise<BlogModel | null>{
    return await this.dataSource.query(`
    SELECT *
        FROM public."Blogs"
        WHERE "id" = ${blogId} 
    `)
  }
  async banBlog(blogId : number, status : BlogBanInfo) : Promise<boolean>{
    await this.dataSource.query(`
    UPDATE public."Blogs"
        SET "isBanned"=${status.isBanned}, "banDate"='${status.banDate}'
        WHERE id=${blogId}
    `)
    return true
  }
  async bindUser(blogId : number, userInfo : BlogOwnerModel) : Promise <boolean>{
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