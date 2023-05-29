import { QueryModelBlogs } from "../../../helpers/helpers.schema";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BlogsRepository } from "./blogs.repository";
import { BlogModel, BlogOwnerModel, PaginatedClass } from "../../public/blogs/blogs.schema";
import { UsersRepository } from "../users/users.repository";
import { QueryRepository } from "../../../helpers/query.repository";
import { UserModel } from "../users/users.schema";

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository : BlogsRepository, protected usersRepository : UsersRepository, protected queryRepository : QueryRepository) {
  }
  async getBlogs(query : QueryModelBlogs): Promise<PaginatedClass>{
    const total = await this.blogsRepository.getBlogsCount(query.searchNameTerm)
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : BlogModel[] = await this.queryRepository.paginationForBlogs(query);
    return await this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async bindBlog(blogId : string, userId : string) : Promise <boolean>{
    const user : UserModel | null = await this.usersRepository.getUser(userId)
    if (!user) throw new NotFoundException()
    const blog : BlogModel | null = await this.blogsRepository.getBlog(blogId)
    if(!blog) throw new NotFoundException()
    if (blog.blogOwnerInfo.userId !== null) throw new BadRequestException()
    const userInfo : BlogOwnerModel = {
      userId : userId,
      userLogin : user.login
    }
    return await this.blogsRepository.bindUser(blogId, userInfo)
  }
}