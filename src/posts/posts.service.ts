import { PostsRepository } from "./posts.repository";
import { QueryModelComments, QueryModelPosts } from "../helpers/helpers.schema";
import { QueryRepository } from "../helpers/query.repository";
import { PostModel } from "./posts.schema";
import { BlogModel, PaginatedClass } from "../blogs/blogs.schema";
import { BlogsRepository } from "../blogs/blogs.repository";
import { CommentsDto, PostsDto } from "./posts.dto";
import { Injectable } from "@nestjs/common";
import { JwtService } from "../jwt.service";
import { CommentsService } from "../comments/comments.service";
import { CommentModel } from "../comments/comments.schema";
import { ErrorCodes, errorHandler } from "../helpers/errors";
import { LikesRepository } from "../likes/likes.repository";
import { LikesHelpers } from "../helpers/likes.helper";

@Injectable()
export class PostsService {
  constructor(protected postsRepository : PostsRepository,
              protected blogsRepository : BlogsRepository,
              protected queryRepository : QueryRepository,
              protected jwtService : JwtService,
              protected commentsService : CommentsService,
              protected likesRepository : LikesRepository,
              protected likesHelper : LikesHelpers) {
  }
  async getPosts(query : QueryModelPosts) : Promise<PaginatedClass>{
    const total : number = (await this.postsRepository.getPosts()).length
    const pageCount = Math.ceil( total / query.pageSize)
    const items = await this.queryRepository.paginatorForPosts(query)
    const paginatedItems = await this.queryRepository.postsMapping(items, undefined)
    return await this.queryRepository.paginationForm(pageCount,total,paginatedItems,query)
  }
  async getPostsWithUser(query : QueryModelPosts, token : string) : Promise<PaginatedClass>{
    const userId : string = await this.jwtService.getUserByIdToken(token)
    const total : number = (await this.postsRepository.getPosts()).length
    const pageCount = Math.ceil( total / query.pageSize)
    const items = await this.queryRepository.paginatorForPosts(query)
    const paginatedItems = await this.queryRepository.postsMapping(items, userId)
    return await this.queryRepository.paginationForm(pageCount,total,paginatedItems,query)
  }
  async getPostsByBlogId (query : QueryModelPosts, blogId: string) : Promise<PaginatedClass | null>{
    const blog : BlogModel | null = await this.blogsRepository.getBlog(blogId)
    if(!blog) return null
    let total : number = await this.postsRepository.countPostsByBlogId(blogId)
    const pageCount = Math.ceil( total / query.pageSize)
    const items : PostModel[] = await this.queryRepository.paginatorForPostsWithBlog(query, blogId);
    return await this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async getPost(id: string) : Promise<null | PostModel> {
    const post =  await this.postsRepository.getPost(id)
    if (!post) return null
    return post
  }
  async deletePost(id: string) : Promise<boolean> {
    return await this.postsRepository.deletePost(id)
  }
  async createPost(post: PostsDto) : Promise <PostModel | null>{
    const blog : BlogModel | null = await this.blogsRepository.getBlog(post.blogId)
    if (!blog) return null
    const blogName = blog.name
    const newPost : PostModel = {
      id: '' + (+(new Date())),
      title : post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: blogName,
      createdAt : new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: []
      }
    };
    const createdPost = await this.postsRepository.createPost(newPost);
    if (!createdPost) return null
    return createdPost;
  }
  async updatePost(post : PostsDto, id : string) : Promise <boolean>{
    return await this.postsRepository.updatePost(post,id)
  }
  async getComments(query : QueryModelComments, token : string, postId : string) : Promise<PaginatedClass>{
    const foundPost = await this.getPost(postId)
    if (foundPost === null) {
      errorHandler(ErrorCodes.NotFound)
      return null
    } else {
      let userId = await this.jwtService.getUserByIdToken(token)
      const foundComments = await this.commentsService.getAllCommentsByPostId(query, postId, userId)
      return foundComments
    }
  }
  async createComment(postId : string, content : string, token : string) : Promise <CommentModel | null>{
    const foundPost : PostModel | null = await this.postsRepository.getPost(postId)
    if (foundPost === null) {
      errorHandler(ErrorCodes.NotFound)
      return null
    } else {
      let userId = await this.jwtService.getUserByIdToken(token)
      const createdComment = await this.commentsService.createComment(postId, userId, content)
      if (createdComment) {
        return createdComment
      } else {
        errorHandler(ErrorCodes.NotAutorized)
        return null
      }
    }
  }
  async changeLikeStatus(requestType : string, postId : string, token : string) : Promise <boolean> {
    const post : PostModel | null = await this.postsRepository.getPost(postId)
    if (!post) {
      return false
    }
    let userId = await this.jwtService.getUserByIdToken(token)
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
    await this.changeTotalCount(postId)
    return true;
  }

  async changeTotalCount(postId : string) : Promise<boolean> {
    const likesCount : number = await this.likesRepository.findLikes(postId)
    const dislikesCount : number = await this.likesRepository.findDislikes(postId)
    return this.postsRepository.changeLikesTotalCount(postId, likesCount, dislikesCount)
  }
  async deleteAllData() {
    await this.postsRepository.deleteAllData();
  }
}