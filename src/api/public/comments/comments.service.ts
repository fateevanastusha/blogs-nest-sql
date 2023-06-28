import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
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
  async getCommentById (id : number) : Promise<CommentViewModel> {
    let comment : CommentModel | null = await this.commentsRepository.getCommentById(id)
    if (!comment) throw new NotFoundException()
    const user : UserModel[] | null = await this.usersRepository.getFullUser(comment.userId)
    if (user.length === 0) throw new NotFoundException()
    if (user[0].isBanned === true) throw new NotFoundException()
    const likes : LikesInfo = (await this.likesRepository.getLikesInfo(id))[0]
    const commentView : CommentViewModel = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount : likes.likesCount,
        dislikesCount : likes.dislikesCount,
        myStatus : "None"
      }
    }
    return commentView
  }

  async getCommentByIdWithUser (id : number, userId : number) : Promise<CommentViewModel> {
    let comment : CommentModel | null = await this.commentsRepository.getCommentById(id)
    if (!comment) return null
    const user : UserModel[] | null = await this.usersRepository.getFullUser(comment.userId)
    if (user.length === 0) throw new NotFoundException()
    if (user[0].isBanned === true) throw new NotFoundException()
    const likes : LikesInfo = await this.likesRepository.getLikesInfoWithUser(userId, comment.id)
    const commentView : CommentViewModel = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: likes[0]
    }
    return commentView
  }
  async deleteCommentById (id: number) : Promise<boolean> {
    return this.commentsRepository.deleteCommentById(id)
  }
  async updateCommentById (content: string, id: number) : Promise <boolean> {
    return await this.commentsRepository.updateCommentById(content, id)
  }
  //change like status
  async changeLikeStatus(requestType : string, commentId : number, userId : number) : Promise <boolean> {
    const comment : CommentModel | null = await this.commentsRepository.getCommentById(commentId)
    if (!comment) return false;
    const status1 = await this.likesRepository.findStatus(commentId, userId)
    //REFACTOR TO NOT DELETE LIKE IF NONE
    const currentStatus = await this.likesHelper.requestType(status1[0])
    if (currentStatus === requestType) return true
    const status = {
      status : requestType,
      userId : userId,
      postOrCommentId : commentId,
      createdAt : new Date().toISOString()
    }
    if (currentStatus === "None"){
      const res = await this.likesRepository.createNewStatusForComment(status)
      if(!res) throw new BadRequestException()
    }
    else if (requestType === "None"){
      await this.likesRepository.deleteStatus(commentId, userId)
    } else {
      await this.likesRepository.updateStatus(status)
    }
    return true;
  }
}