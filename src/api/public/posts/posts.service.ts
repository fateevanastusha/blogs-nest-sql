import { PostsRepository } from "./posts.repository";
import { QueryModelComments, QueryModelPosts } from "../../../helpers/helpers.schema";
import { QueryRepository } from "../../../helpers/query.repository";
import { PostModel, PostViewModel } from "./posts.schema";
import { BlogModel, PaginatedClass } from "../blogs/blogs.schema";
import { BloggersRepository } from "../../blogger/bloggers/bloggers.repository";
import { PostsDto } from "./posts.dto";
import { ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "../../../jwt.service";
import { CommentsService } from "../comments/comments.service";
import { LikesRepository } from "../../../likes/likes.repository";
import { LikesHelpers } from "../../../helpers/likes.helper";
import { LikeViewModel } from "../../../likes/likes.schema";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { LikesInfo } from "../comments/comments.schema";

@Injectable()
export class PostsService {
  constructor(protected postsRepository : PostsRepository,
              protected blogsRepository : BloggersRepository,
              protected queryRepository : QueryRepository,
              protected jwtService : JwtService,
              protected commentsService : CommentsService,
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
    const userId : string = await this.jwtService.getUserIdByToken(token)
    const total : number = (await this.postsRepository.getPosts()).length
    const pageCount = Math.ceil( total / query.pageSize)
    const items = await this.queryRepository.paginatorForPosts(query)
    const paginatedItems = await this.queryRepository.postsMapping(items, userId)
    return await this.queryRepository.paginationForm(pageCount,total,paginatedItems,query)
  }
  async getPostsByBlogId (query : QueryModelPosts, blogId: string, token : string) : Promise<PaginatedClass | null>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const blog : BlogModel | null = await this.blogsRepository.getFullBlog(blogId)
    if(!blog) return null
    let total : number = await this.postsRepository.countPostsByBlogId(blogId)
    let pageCount = Math.ceil( total / query.pageSize)
    let items : PostModel[] = await this.queryRepository.paginatorForPostsWithBlog(query, blogId);
    if(blog.isBanned) {
      items = [];
      total = 0
      pageCount = 0
    }
    const paginatedPosts : PostModel[] = await this.queryRepository.postsMapping(items, userId)
    return await this.queryRepository.paginationForm(pageCount, total, paginatedPosts, query)
  }
  async getPostWithUser(id: string, header : string) : Promise<PostViewModel> {
    const post =  await this.postsRepository.getPost(id);
    if (!post) return null
    const blog = await this.blogsRepository.getFullBlog(post.blogId)
    if(blog.isBanned) throw new NotFoundException()
    let likesInfo : LikesInfo
    //with user
    if(header){
      const token = header.split(" ")[1];
      const userId : string = await this.jwtService.getUserIdByToken(token)
      likesInfo = await this.likesRepository.getLikesInfoWithUser(userId,id)
    }
    //without user
    else {
      likesInfo = await this.likesRepository.getLikesInfo(id)
    }
    const newestLikes : LikeViewModel[] = await this.likesRepository.getLastLikes(id)
    const postView : PostViewModel = {
      id : post.id,
      title : post.title,
      shortDescription : post.shortDescription,
      content : post.content,
      blogId : post.blogId,
      blogName : post.blogName,
      createdAt : post.createdAt,
      extendedLikesInfo : {...likesInfo, newestLikes}
    }
    return postView
  }
  async getPost(id: string) : Promise<null | PostModel> {
    const post =  await this.postsRepository.getPost(id);
    if (!post) return null
    return post
  }
  async updatePost(post : PostsDto, postId : string, token : string) : Promise <boolean>{
    const userId : string = await this.jwtService.getUserIdByToken(token)
    const blog : BlogModel = await this.blogsRepository.getFullBlog(post.blogId)
    if (!blog) throw new NotFoundException()
    if (blog.userId !== userId) throw new ForbiddenException()
    return await this.postsRepository.updatePost(post,postId)
  }
  async getComments(query : QueryModelComments, header : string, postId : string) : Promise<PaginatedClass>{
    const foundPost = await this.getPost(postId)
    if (foundPost === null) {
      throw new NotFoundException()
      return null
    } else {
      let token
      if(header){
        token = header.split(" ")[1]
      } else {
        token = 'null'
      }
      let userId = await this.jwtService.getUserIdByToken(token)
      const foundComments = await this.commentsService.getAllCommentsByPostId(query, postId, userId)
      return foundComments
    }
  }
  async changeLikeStatus(requestType : string, postId : string, header : string) : Promise <boolean> {
    if(!header) throw new UnauthorizedException(401)
    const token = header.split(" ")[1]
    const post : PostModel | null = await this.postsRepository.getPost(postId)
    if (!post) {
      return false
    }
    let userId = await this.jwtService.getUserIdByToken(token)
    const status1 = await this.likesRepository.findStatus(postId, userId)
    const currentStatus = await this.likesHelper.requestType(status1)
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
      await this.likesRepository.createNewStatus(status)
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