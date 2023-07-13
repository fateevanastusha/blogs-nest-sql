import { PostsRepository } from "../repository/posts.repository";
import { QueryModelComments, QueryModelPosts } from "../../../utils/query.schema";
import { QueryRepository } from "../../../utils/query.repository";
import { PostModel, PostViewModel } from "../schemas/posts.schema";
import { BlogModel, PaginatedClass } from "../../blogs/schemas/blogs.schema";
import { PostsDto } from "../dto/posts.dto";
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "../../../utils/jwt.service";
import { LikesRepository } from "../../likes/repository/likes.repository";
import { LikesHelpers } from "../../../utils/likes.mapper";
import { LikeViewModel } from "../../likes/schemas/likes.schema";
import { UsersRepository } from "../../users/repository/users.repository";
import { CommentModel, LikesInfo } from "../../comments/schemas/comments.schema";
import { CommentsRepository } from "../../comments/repository/comments.repository";
import { BlogsRepository } from "../../blogs/repository/blogs.repository";

@Injectable()
export class PostsService {
  constructor(protected postsRepository : PostsRepository,
              protected blogsRepository : BlogsRepository,
              protected queryRepository : QueryRepository,
              protected jwtService : JwtService,
              protected commentsRepository : CommentsRepository,
              protected likesRepository : LikesRepository,
              protected likesHelper : LikesHelpers,
              protected usersRepository : UsersRepository) {
  }
  async getPosts(query : QueryModelPosts) : Promise<PaginatedClass>{
    const total : number = (await this.postsRepository.getPosts()).length
    const pageCount = Math.ceil( total / query.pageSize)
    const items = await this.queryRepository.paginatorForPosts(query)
    const paginatedItems = await this.queryRepository.postsMapping(items)
    return await this.queryRepository.paginationForm(pageCount,total,paginatedItems,query)
  }
  async getPostsWithUser(query : QueryModelPosts, token : string) : Promise<PaginatedClass>{
    const userId : string = await this.jwtService.getUserIdByToken(token)
    const total : number = (await this.postsRepository.getPosts()).length
    const pageCount = Math.ceil( total / query.pageSize)
    const items = await this.queryRepository.paginatorForPosts(query)
    const paginatedItems = await this.queryRepository.postsMappingWithUser(items, userId)
    return await this.queryRepository.paginationForm(pageCount,total,paginatedItems,query)
  }
  async getPostsByBlogId (query : QueryModelPosts, blogId: string, token : string | null) : Promise<PaginatedClass>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const blog = await this.blogsRepository.getFullBlog(blogId)
    let total : number = await this.postsRepository.countPostsByBlogId(blogId)
    let pageCount = Math.ceil( total / query.pageSize)
    let items : PostModel[] = await this.queryRepository.paginatorForPostsWithBlog(query, blogId);
    if(blog.isBanned) {
      items = [];
      total = 0
      pageCount = 0
    }
    let paginatedPosts : PostModel[]
    if(!token){
      paginatedPosts = await this.queryRepository.postsMapping(items)
    }
    else {
      paginatedPosts = await this.queryRepository.postsMappingWithUser(items, userId)
    }
    return await this.queryRepository.paginationForm(pageCount, total, paginatedPosts, query)
  }
  async getComments(query : QueryModelComments, header : string, postId : string) : Promise<PaginatedClass>{
    await this.postsRepository.getPost(postId)
    const items : CommentModel[] = await this.queryRepository.paginatorForCommentsByPostId(query, postId)
    let mappedComments
    if(header){
      let token = header.split(" ")[1]
      let userId = await this.jwtService.getUserIdByToken(token)
      mappedComments = await this.queryRepository.commentsMappingWithUser(items, userId)
      } else {
      mappedComments = await this.queryRepository.commentsMapping(items)
      }
    let total : number = await this.commentsRepository.countCommentsByPostId(postId)
    const pageCount : number = Math.ceil( total / query.pageSize)
    let paginatedComments = await this.queryRepository.paginationForm(pageCount, total, mappedComments, query)
    return paginatedComments
  }
  async changeLikeStatus(requestType : string, postId : string, header : string) : Promise <boolean> {
    if(!header) throw new UnauthorizedException(401)
    const token = header.split(" ")[1]
    await this.postsRepository.getPost(postId)
    let userId = await this.jwtService.getUserIdByToken(token)
    const status1 = await this.likesRepository.findStatus(postId, userId)
    const currentStatus = await this.likesHelper.requestType(status1[0])
    if (currentStatus === requestType) {
      return true
    }
    const status = {
      status : requestType,
      userId : userId,
      postOrCommentId : postId,
      createdAt : new Date().toISOString()
    }
    if (currentStatus === "None"){
      await this.likesRepository.createNewStatusForPost(status)
    }
    else if (requestType === "None"){

      await this.likesRepository.deleteStatus(postId, userId)
    } else {
      await this.likesRepository.updateStatus(status)
    }
    return true;
  }
}