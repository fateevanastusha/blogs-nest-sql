import { PostsRepository } from "./posts.repository";
import { QueryModelComments, QueryModelPosts } from "../../../helpers/helpers.schema";
import { QueryRepository } from "../../../helpers/query.repository";
import { PostModel, PostViewModel } from "./posts.schema";
import { BlogModel, PaginatedClass } from "../blogs/blogs.schema";
import { PostsDto } from "./posts.dto";
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "../../../jwt.service";
import { LikesRepository } from "../../../likes/likes.repository";
import { LikesHelpers } from "../../../helpers/likes.helper";
import { LikeViewModel } from "../../../likes/likes.schema";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { CommentModel, LikesInfo } from "../comments/comments.schema";
import { CommentsRepository } from "../comments/comments.repository";
import { BlogsRepository } from "../blogs/blogs.repository";

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
    const paginatedItems = await this.queryRepository.postsMapping(items, undefined)
    return await this.queryRepository.paginationForm(pageCount,total,paginatedItems,query)
  }
  async getPostsWithUser(query : QueryModelPosts, token : string) : Promise<PaginatedClass>{
    const userId : number = await this.jwtService.getUserIdByToken(token)
    const total : number = (await this.postsRepository.getPosts()).length
    const pageCount = Math.ceil( total / query.pageSize)
    const items = await this.queryRepository.paginatorForPosts(query)
    const paginatedItems = await this.queryRepository.postsMapping(items, userId)
    return await this.queryRepository.paginationForm(pageCount,total,paginatedItems,query)
  }
  async getPostsByBlogId (query : QueryModelPosts, blogId: number, token : string) : Promise<PaginatedClass | null>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const blog : BlogModel[] = await this.blogsRepository.getFullBlog(blogId)
    if(blog.length === 0 ) return null
    let total : number = await this.postsRepository.countPostsByBlogId(blogId)
    let pageCount = Math.ceil( total / query.pageSize)
    let items : PostModel[] = await this.queryRepository.paginatorForPostsWithBlog(query, blogId);
    if(blog[0].isBanned) {
      items = [];
      total = 0
      pageCount = 0
    }
    const paginatedPosts : PostModel[] = await this.queryRepository.postsMapping(items, userId)
    return await this.queryRepository.paginationForm(pageCount, total, paginatedPosts, query)
  }
  async getPost(id: number) : Promise<null | PostModel> {
    const post : PostModel[] =  await this.postsRepository.getPost(id);
    if (post.length === 0) return null
    return post[0]
  }
  async updatePost(post : PostsDto, postId : number, token : string) : Promise <boolean>{
    const userId : number = await this.jwtService.getUserIdByToken(token)
    const blog : BlogModel[] = await this.blogsRepository.getFullBlog(post.blogId)
    if (blog.length ===0 ) throw new NotFoundException()
    if (blog[0].userId !== userId) throw new ForbiddenException()
    return await this.postsRepository.updatePost(post,postId)
  }
  async getComments(query : QueryModelComments, header : string, postId : number) : Promise<PaginatedClass>{
    const foundPost = await this.postsRepository.getPost(postId);
    if (foundPost.length === 0) throw new NotFoundException()
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
  async changeLikeStatus(requestType : string, postId : number, header : string) : Promise <boolean> {
    if(!header) throw new UnauthorizedException(401)
    const token = header.split(" ")[1]
    const post : PostModel[] = await this.postsRepository.getPost(postId)
    if (post.length === 0) return false
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
    //if no status
    if (currentStatus === "None"){
      //add new like or dislike
      await this.likesRepository.createNewStatusForPost(status)
    }
    else if (requestType === "None"){
      //delete status
      await this.likesRepository.deleteStatus(postId, userId)
    } else {
      //change status
      await this.likesRepository.updateStatus(status)
    }
    return true;
  }
  async deleteAllData() {
    await this.postsRepository.deleteAllData();
  }
}