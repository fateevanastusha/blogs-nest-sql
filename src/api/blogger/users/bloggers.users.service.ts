import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { BanUserForBlogDto } from "./bloggers.users.dto";
import { JwtService } from "../../../jwt.service";
import { BloggersRepository } from "../bloggers/bloggers.repository";
import { QueryRepository } from "../../../helpers/query.repository";
import { QueryModelBannedUsersForBlog } from "../../../helpers/helpers.schema";
import { BannedUserInfo, BlogModel, PaginatedClass } from "../../public/blogs/blogs.schema";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { UserModel, UserViewModel } from "../../superadmin/users/users.schema";
import { User } from "node-telegram-bot-api";

@Injectable()
export class BloggersUsersService {
  constructor(protected jwtService : JwtService,
              protected bloggerRepository : BloggersRepository,
              protected queryRepository : QueryRepository,
              protected usersRepository : UsersRepository) {}
  async BanUserForBlog(token : string, userId : string, banInfo : BanUserForBlogDto) : Promise<boolean> {
    const user : UserModel | null = await this.usersRepository.getFullUser(userId)
    if(!user) throw new NotFoundException()
    const ownerId = await this.jwtService.getUserIdByToken(token)
    const blog : BlogModel = await this.bloggerRepository.getFullBlog(banInfo.blogId)
    if(!blog) throw new NotFoundException()
    if(blog.userId !== ownerId) throw new ForbiddenException()
    const bannedUsers  = blog.bannedUsers
    if (banInfo.isBanned === true){
      const bannedInfo : BannedUserInfo = {
        isBanned : banInfo.isBanned,
        banDate : new Date().toISOString(),
        banReason : banInfo.banReason,
        userId : userId
      }
      bannedUsers.push(bannedInfo)
      return await this.bloggerRepository.updateBlogBannedUsers(banInfo.blogId, bannedUsers)
    } else {
      const index = bannedUsers.findIndex(user => user.userId === userId);
      if (index > -1) {
        bannedUsers.splice(index, 1);
      }
      return await this.bloggerRepository.updateBlogBannedUsers(banInfo.blogId, bannedUsers)
    }
  }
  async getAllBannedUsers(token : string, blogId : string, query : QueryModelBannedUsersForBlog) : Promise<PaginatedClass>{
    const ownerId = await this.jwtService.getUserIdByToken(token)
    const blog = await this.bloggerRepository.getFullBlog(blogId)
    if(!blog) throw new NotFoundException()
    if(blog.userId !== ownerId) throw new ForbiddenException()
    const banInfo = [...blog.bannedUsers]
    const bannedId  = []
    for(let i = 0; i < blog.bannedUsers.length; i++){
      bannedId.push(blog.bannedUsers[i].userId)
    }
    const total : number = await this.usersRepository.getBlogBannedUsersCount(bannedId, query.searchLoginTerm)
    const pageCount : number = Math.ceil( total / query.pageSize);
    const items : UserViewModel[] = await this.queryRepository.paginationForBlogBannedUsers(query, bannedId)
    const mappedItems = items.map((a) => {
      let userInfo = banInfo.find(item => item.userId === a.id)
      return  {
        id : a.id,
        login : a.login,
        banInfo : {
          isBanned : userInfo.isBanned,
          banDate : userInfo.banDate,
          banReason : userInfo.banReason
        }
      }})
    return await this.queryRepository.paginationForm(pageCount,total,mappedItems,query)
  }
}