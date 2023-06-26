import { Injectable, NotFoundException } from "@nestjs/common";
import { CommentsRepository } from "./comments.repository";
import { LikesRepository } from "../../../likes/likes.repository";
import { UserModel } from "../../superadmin/users/users.schema";
import { CommentModel, CommentViewModel, LikesInfo } from "./comments.schema";
import { QueryCommentsUsers } from "../../../helpers/helpers.schema";
import { QueryRepository } from "../../../helpers/query.repository";
import { PaginatedClass } from "../blogs/blogs.schema";
import { LikesHelpers } from "../../../helpers/likes.helper";
import { UsersRepository } from "../../superadmin/users/users.repository";

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository : CommentsRepository,
              protected likesRepository : LikesRepository,
              protected queryRepository : QueryRepository,
              protected likesHelper : LikesHelpers,
              protected usersRepository : UsersRepository) {}
  async getCommentById (id : string) : Promise<CommentViewModel> {
    let comment : CommentModel | null = await this.commentsRepository.getCommentById(id)
    if (!comment) throw new NotFoundException()
    const user : UserModel[] | null = await this.usersRepository.getFullUser(comment.userId)
    if (user.length === 0) throw new NotFoundException()
    if (user[0].isBanned === true) throw new NotFoundException()
    const likes : LikesInfo = await this.likesRepository.getLikesInfo(id)
    const commentView : CommentViewModel = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: likes
    }
    return commentView
  }

  async getCommentByIdWithUser (id : string, userId : string) : Promise<CommentViewModel> {
    let comment : CommentModel | null = await this.commentsRepository.getCommentById(id)
    if (!comment) return null
    const user : UserModel[] | null = await this.usersRepository.getFullUser(comment.userId)
    if (user.length === 0) throw new NotFoundException()
    if (user[0].isBanned === true) throw new NotFoundException()
    const likes : LikesInfo = await this.likesRepository.getLikesInfoWithUser(userId, comment.id)
    console.log(likes);
    const commentView : CommentViewModel = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: likes
    }
    return commentView
  }
  async deleteCommentById (id: string) : Promise<boolean> {
    return this.commentsRepository.deleteCommentById(id)
  }
  async updateCommentById (content: string, id: string) : Promise <boolean> {
    return await this.commentsRepository.updateCommentById(content, id)
  }
  async getAllCommentsByPostId(query : QueryCommentsUsers, postId: string, userId : string) : Promise<PaginatedClass> {
    const items : CommentModel[] = await this.queryRepository.paginatorForCommentsByPostId(query, postId)
    const filteredItems : CommentModel[] = await this.queryRepository.filterCommentsOfBannedUser(items)
    let allComments : number = await this.commentsRepository.countCommentsByPostId(postId)
    let total = allComments - (items.length - filteredItems.length)
    const pageCount : number = Math.ceil( total / query.pageSize)
    let comments = await this.queryRepository.commentsMapping(filteredItems, userId)
    let paginatedComments = await this.queryRepository.paginationForm(pageCount, total, comments, query)
    return paginatedComments
  }
  //change like status
  async changeLikeStatus(requestType : string, commentId : string, userId : string) : Promise <boolean> {
    const comment : CommentModel | null = await this.commentsRepository.getCommentById(commentId)
    if (!comment) return false;
    const status1 = await this.likesRepository.findStatus(commentId, userId)
    const currentStatus = await this.likesHelper.requestType(status1)
    if (currentStatus === requestType) return true
    const status = {
      status : requestType,
      userId : userId,
      postOrCommentId : commentId,
      createdAt : new Date().toISOString()
    }
    if (currentStatus === "None"){
      await this.likesRepository.createNewStatus(status)
    }
    else if (requestType === "None"){
      await this.likesRepository.deleteStatus(commentId, userId)
    } else {
      await this.likesRepository.updateStatus(status)
    }
    return true;
  }
}