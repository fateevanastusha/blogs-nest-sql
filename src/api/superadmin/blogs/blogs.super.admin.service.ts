import { QueryModelBlogs } from "../../../helpers/helpers.schema";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { BlogsSuperAdminRepository } from "./blogs.super.admin.repository";
import { BlogBanInfo, BlogModel, BlogOwnerModel, PaginatedClass } from "../../public/blogs/blogs.schema";
import { UsersRepository } from "../users/users.repository";
import { QueryRepository } from "../../../helpers/query.repository";
import { UserModel } from "../users/users.schema";
import { BanBlogDto } from "./blogs.super.admin.dto";

@Injectable()
export class BlogsSuperAdminService {
  constructor(protected blogsRepository : BlogsSuperAdminRepository, protected usersRepository : UsersRepository, protected queryRepository : QueryRepository) {
  }
  async getBlogs(query : QueryModelBlogs): Promise<PaginatedClass>{
    let total = await this.blogsRepository.getBlogsCount(query.searchNameTerm)
    if(!total) total = 0
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : BlogModel[] = await this.queryRepository.paginationForBlogsWithAdmin(query);
    return await this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async banBlog(blogId : string, request : BanBlogDto) : Promise<boolean> {
    const banInfo : BlogBanInfo = {
      isBanned : request.isBanned,
      banDate : new Date().toISOString()
    }
    return await this.blogsRepository.banBlog(blogId, banInfo)
  }
  async bindBlog(blogId : string, userId : string) : Promise <boolean>{
    const user : UserModel | null = await this.usersRepository.getFullUser(userId)
    if (!user) throw new NotFoundException()
    const blog : BlogModel | null = await this.blogsRepository.getBlog(blogId)
    if(!blog) throw new NotFoundException()
    // if (blog.blogOwnerInfo.userId !== null) throw new BadRequestException()
    const userInfo : BlogOwnerModel = {
      userId : userId,
      userLogin : user.login
    }
    return await this.blogsRepository.bindUser(blogId, userInfo)
  }
}