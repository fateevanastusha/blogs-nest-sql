import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "../../jwt.service";
import { QueryRepository } from "../../helpers/query.repository";
import { QueryModelBannedUsersForBlog } from "../../helpers/helpers.schema";
import { BannedUserInfo, BlogModel, CreateBannedUserInfo, PaginatedClass } from "../blogs/blogs.schema";
import { UsersRepository } from "./users.repository";
import { UserModel } from "./users.schema";
import { BannedUsersRepository } from "./bloggers.banned.users.repository";
import { BlogsRepository } from "../blogs/blogs.repository";
import { BanUserForBlogDto } from "./users.dto";

@Injectable()
export class BloggersUsersService {
  constructor(protected jwtService : JwtService,
              protected bloggerRepository : BlogsRepository,
              protected queryRepository : QueryRepository,
              protected usersRepository : UsersRepository,
              protected banRepository : BannedUsersRepository) {}
  async BanUserForBlog(token : string, userId : string, banInfo : BanUserForBlogDto) : Promise<boolean> {
    const user : UserModel[] | null = await this.usersRepository.getFullUser(userId)
    if(user.length === 0) throw new NotFoundException()
    const ownerId = await this.jwtService.getUserIdByToken(token)
    const blog = await this.bloggerRepository.getFullBlog(banInfo.blogId)
    if(blog.userId !== ownerId) throw new ForbiddenException()
    if (banInfo.isBanned === true){
      const bannedInfo : CreateBannedUserInfo = {
        banDate : new Date().toISOString(),
        banReason : banInfo.banReason,
        userId : userId,
        blogId : banInfo.blogId,
        userLogin : user[0].login
      }
      return await this.banRepository.banUser(bannedInfo)
    } else {
      return await this.banRepository.unbanUser(banInfo.blogId, userId)
    }
  }
  async getAllBannedUsers(token : string, blogId : string, query : QueryModelBannedUsersForBlog) : Promise<PaginatedClass>{
    if(query.sortBy === 'login') query.sortBy = 'userLogin'
    const userId = await this.jwtService.getUserIdByToken(token)
    const blog = await this.bloggerRepository.getFullBlog(blogId)
    if(blog.userId !== userId) throw new ForbiddenException()
    const total: number = await this.banRepository.getBannedUsersCount(blogId)
    const pageCount = Math.ceil( total / +query.pageSize)
    const bannedUsers : BannedUserInfo[] = await this.queryRepository.paginationForBlogBannedUsers(query, blogId)
    const mappedUsers = bannedUsers.map((a) => {
      return  {
        id : a.userId + '',
        login : a.userLogin,
        banInfo : {
          isBanned : true,
          banDate : a.banDate,
          banReason : a.banReason
        }
      }})
    return await this.queryRepository.paginationForm(pageCount,total,mappedUsers,query)
  }
}