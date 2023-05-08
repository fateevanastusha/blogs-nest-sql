import { Injectable } from "@nestjs/common";
import { CommentsRepository } from "./comments.repository";
import { LikesRepository } from "../likes/likes.repository";
import { UserModel } from "../users/users.schema";
import { CommentModel } from "./comments.schema";
import { QueryCommentsUsers } from "../helpers/helpers.schema";
import { QueryRepository } from "../helpers/query.repository";
import { PaginatedClass } from "../blogs/blogs.schema";
import { LikesHelpers } from "../helpers/likes.helper";
import { UsersService } from "../users/users.service";

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository : CommentsRepository,
              protected likesRepository : LikesRepository,
              protected queryRepository : QueryRepository,
              protected likesHelper : LikesHelpers,
              protected usersService : UsersService) {}

  async getCommentById (id : string) : Promise<CommentModel | null> {
    let comment : CommentModel | null = await this.commentsRepository.getCommentById(id)
    if (!comment) return null
    return comment
  }

  async getCommentByIdWithUser (id : string, userId : string) : Promise<CommentModel | null> {
    const currentStatus = await this.likesHelper.requestType(await this.likesRepository.findStatus(id, userId))
    let comment : CommentModel | null = await this.commentsRepository.getCommentById(id)
    if (!comment) return null
    comment.likesInfo.myStatus = currentStatus
    return comment
  }
  async deleteCommentById (id: string) : Promise<boolean> {
    return this.commentsRepository.deleteCommentById(id)
  }
  async updateCommentById (content: string, id: string) : Promise <boolean> {
    return await this.commentsRepository.updateCommentById(content, id)
  }
    async createComment(postId : string, userId: string, content : string) : Promise <CommentModel | null> {
    const user : UserModel | null = await this.usersService.getUser(userId)
    const comment : CommentModel = {
      id : (+new Date()).toString(),
      content : content,
      commentatorInfo : {
        userId: userId,
        userLogin: user!.login
      },
      createdAt: new Date().toISOString(),
      postId : postId,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None"
      }
    }
    return this.commentsRepository.createNewComment(comment);
  }
  async getAllCommentsByPostId(query : QueryCommentsUsers, postId: string, userId : string) : Promise<PaginatedClass> {
    let total : number = await this.commentsRepository.countCommentsByPostId(postId)
    const pageCount : number = Math.ceil( total / query.pageSize)
    const items : CommentModel[] = await this.queryRepository.paginatorForCommentsByBlogId(query, postId);
    let comments = await this.queryRepository.commentsMapping(items, userId)
    let paginatedComments = await this.queryRepository.paginationForm(pageCount, total, comments, query)
    return paginatedComments
  }

  //change like status

  async changeLikeStatus(requestType : string, commentId : string, userId : string) : Promise <boolean> {
    const comment : CommentModel | null = await this.commentsRepository.getCommentById(commentId)
    if (!comment) {
      return false;
    }
    const status1 = await this.likesRepository.findStatus(commentId, userId)
    const currentStatus = await this.likesHelper.requestType(status1)
    if (currentStatus === requestType) {
      return true
    }
    const status = {
      status : requestType,
      userId : userId,
      postOrCommentId : commentId,
      createdAt : new Date().toISOString()
    }

    //if no status
    if (currentStatus === "None"){
      //add new like or dislike
      await this.likesRepository.createNewStatus(status)
    }

    else if (requestType === "None"){
      //delete status
      await this.likesRepository.deleteStatus(commentId, userId)
    } else {
      //change status
      await this.likesRepository.updateStatus(status)
    }
    //change total
    await this.changeTotalCount(commentId)
    return true;
  }

  async changeTotalCount(commentId : string) : Promise<boolean> {
    const likesCount : number = await this.likesRepository.findLikes(commentId)
    const dislikesCount : number = await this.likesRepository.findDislikes(commentId)
    return this.commentsRepository.changeLikesTotalCount(commentId, likesCount, dislikesCount)
  }
}