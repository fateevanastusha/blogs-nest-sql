import { QueryModelBlogs } from "../../../utils/query.schema";
import { Injectable, NotFoundException } from "@nestjs/common";
import { BlogBanInfo, BlogModel, BlogOwnerModel, PaginatedClass } from "../schemas/blogs.schema";
import { UsersRepository } from "../../users/repository/users.repository";
import { QueryRepository } from "../../../utils/query.repository";
import { UserModel } from "../../users/schemas/users.schema";
import {BanBlogDto} from "../dto/blogs.dto";
import { BlogsRepository } from "../repository/blogs.repository";

@Injectable()
export class BlogsSuperAdminService {
  constructor(protected blogsRepository : BlogsRepository, protected usersRepository : UsersRepository, protected queryRepository : QueryRepository) {
  }
  async getBlogs(query : QueryModelBlogs): Promise<PaginatedClass>{
    let total = await this.blogsRepository.getBlogsCount(query.searchNameTerm)
    if(!total) total = 0
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : BlogModel[] = await this.queryRepository.paginationForBlogsWithAdmin(query);
    const mappedItems = items.map(a => {
      return {
        name: a.name,
        description: a.description,
        websiteUrl: a.websiteUrl,
        id: a.id + '',
        createdAt: a.createdAt,
        isMembership: a.isMembership,
        banInfo: {
          banDate : a.banDate,
          isBanned : a.isBanned
        },
        blogOwnerInfo: {
          userId : a.userId + '',
          userLogin : a.userLogin
        }
      }
    })
    return await this.queryRepository.paginationForm(pageCount, total, mappedItems, query)
  }
  async banBlog(blogId : string, request : BanBlogDto) : Promise<boolean> {
    await this.blogsRepository.getFullBlog(blogId)
    const banInfo : BlogBanInfo = {
      isBanned : request.isBanned,
      banDate : new Date().toISOString()
    }
    return await this.blogsRepository.banBlog(blogId, banInfo)
  }
  async bindBlog(blogId : string, userId : string) : Promise <boolean>{
    const user : UserModel[] | null = await this.usersRepository.getFullUser(userId)
    if (user.length === 0) throw new NotFoundException()
    await this.blogsRepository.getFullBlog(blogId)
    const userInfo : BlogOwnerModel = {
      userId : userId,
      userLogin : user[0].login
    }
    return await this.blogsRepository.bindUser(blogId, userInfo)
  }
}