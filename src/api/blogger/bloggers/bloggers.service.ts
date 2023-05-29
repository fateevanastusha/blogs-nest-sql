import { QueryModelBlogs } from "../../../helpers/helpers.schema";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BlogModel, BlogViewModel, PaginatedClass } from "../../public/blogs/blogs.schema";
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
  async getBlogs(query : QueryModelBlogs, token : string): Promise<PaginatedClass>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const total = await this.blogsRepository.getBlogsCount(query.searchNameTerm, userId)
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : BlogViewModel[] = await this.queryRepository.paginationForBlogsWithUser(query, userId);
    return await this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async deleteBlog(id: string, token : string) : Promise<boolean>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const blogForUpdate : BlogModel | null = await this.blogsRepository.getBlog(id)
    if (!blogForUpdate) throw new NotFoundException();
    if (blogForUpdate.blogOwnerInfo.userId !== userId) throw new ForbiddenException()
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
      isMembership: true,
      blogOwnerInfo : {
        userId: userId,
        userLogin: user.login
      }
    }
    return await this.blogsRepository.createBlog(newBlog);
  }
  async updateBlog(blog : BlogDto, id: string, token : string) : Promise <boolean>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const blogForUpdate : BlogModel | null = await this.blogsRepository.getBlog(id)
    if (!blogForUpdate) throw new NotFoundException();
    if (blogForUpdate.blogOwnerInfo.userId !== userId) throw new ForbiddenException()
    return await this.blogsRepository.updateBlog(blog, id)
  }
  async deleteAllData(){
    await this.blogsRepository.deleteAllData()
  }
}