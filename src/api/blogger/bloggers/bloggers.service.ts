import { QueryModelBlogs, QueryModelComments } from "../../../helpers/helpers.schema";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BlogModel, BlogViewModel, PaginatedClass } from "../../public/blogs/blogs.schema";
import { BloggersRepository } from "./bloggers.repository";
import { QueryRepository } from "../../../helpers/query.repository";
import { BlogDto } from "../../public/blogs/blogs.dto";
import { JwtService } from "../../../jwt.service";
import { PostModel } from "../../public/posts/posts.schema";
import { PostsRepository } from "../../public/posts/posts.repository";
import { CommentsRepository } from "../../public/comments/comments.repository";
import { CommentModel, CommentForBloggerViewModel } from "../../public/comments/comments.schema";

@Injectable()
export class BloggersService {
  constructor(protected blogsRepository : BloggersRepository,
              protected queryRepository : QueryRepository,
              protected postsRepository : PostsRepository,
              protected commentsRepository : CommentsRepository,
              protected jwtService : JwtService) {}
  async getBlogs(query : QueryModelBlogs, token : string): Promise<PaginatedClass>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const total = await this.blogsRepository.getBlogsCount(query.searchNameTerm, userId)
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : BlogViewModel[] = await this.queryRepository.paginationForBlogsWithUser(query, userId);
    return await this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async getComments(query : QueryModelComments, token : string): Promise<PaginatedClass>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const total = await this.commentsRepository.getCommentsCountByBlogOwnerId(userId)
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : CommentForBloggerViewModel[] = await this.queryRepository.paginatorForCommentsByBlogOwner(query, userId)
    return await this.queryRepository.paginationForm(pageCount,total,items,query)
  }
  async updateBlog(blog : BlogDto, id: string, token : string) : Promise <boolean>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const blogForUpdate : BlogModel[] = await this.blogsRepository.getFullBlog(id)
    if (blogForUpdate.length === 0 ) throw new NotFoundException();
    if (blogForUpdate[0].userId !== userId) throw new ForbiddenException()
    return await this.blogsRepository.updateBlog(blog, id)
  }
  async deleteAllData(){
    await this.blogsRepository.deleteAllData()
  }
}