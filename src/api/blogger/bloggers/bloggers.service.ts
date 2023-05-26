import { QueryModelBlogs } from "../../../helpers/helpers.schema";
import { Injectable } from "@nestjs/common";
import { BlogModel, PaginatedClass } from "../../public/blogs/blogs.schema";
import { BloggersRepository } from "./bloggers.repository";
import { QueryRepository } from "../../../helpers/query.repository";
import { BlogDto } from "../../public/blogs/blogs.dto";
import { JwtService } from "../../../jwt.service";
import { UsersRepository } from "../../superadmin/users/users.repository";

@Injectable()
export class BloggersService {
  constructor(protected blogsRepository : BloggersRepository,
              protected queryRepository : QueryRepository,
              protected jwtService : JwtService,
              protected usersRepository : UsersRepository) {}
  async getBlogs(query : QueryModelBlogs): Promise<PaginatedClass>{
    const total = await this.blogsRepository.getBlogsCount(query.searchNameTerm)
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : BlogModel[] = await this.queryRepository.paginationForBlogs(query);
    return await this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async getBlog(id: string) : Promise<BlogModel | null>{
    return await this.blogsRepository.getBlog(id)
  }
  async deleteBlog(id: string) : Promise<boolean>{
    return await this.blogsRepository.deleteBlog(id)
  }
  async createBlog(blog: BlogDto, token : string) : Promise<BlogModel | null>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const user = await this.usersRepository.getUser(userId)
    const newBlog : BlogModel = {
      id: (+new Date()).toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerInfo : {
        userId: userId,
        userLogin: user.login
      }
    }
    return await this.blogsRepository.createBlog(newBlog);
  }
  async updateBlog(blog : BlogDto, id: string) : Promise <boolean>{
    return await this.blogsRepository.updateBlog(blog, id)
  }
  async deleteAllData(){
    await this.blogsRepository.deleteAllData()
  }
}