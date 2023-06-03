import { Injectable, NotFoundException } from "@nestjs/common";
import { CommentsRepository } from "./comments.repository";
import { LikesRepository } from "../../../likes/likes.repository";
import { UserModel } from "../../superadmin/users/users.schema";
import { CommentModel } from "./comments.schema";
import { QueryCommentsUsers } from "../../../helpers/helpers.schema";
import { QueryRepository } from "../../../helpers/query.repository";
import { PaginatedClass } from "../blogs/blogs.schema";
import { LikesHelpers } from "../../../helpers/likes.helper";
import { UsersService } from "../../superadmin/users/users.service";
import { UsersRepository } from "../../superadmin/users/users.repository";

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository : CommentsRepository,
              protected likesRepository : LikesRepository,
              protected queryRepository : QueryRepository,
              protected likesHelper : LikesHelpers,
              protected usersRepository : UsersRepository) {}

  async getCommentById (id : string) : Promise<CommentModel | null> {
    const status = await this.changeTotalCount(id)
    if(!status) throw new NotFoundException()
    let comment : CommentModel | null = await this.commentsRepository.getCommentById(id)
    if (!comment) throw new NotFoundException()
    const userId : string = comment.commentatorInfo.userId
    const user : UserModel | null = await this.usersRepository.getFullUser(userId)
    if (!user) throw new NotFoundException()
    if (user.banInfo.isBanned === true) throw new NotFoundException()
    comment.likesInfo.likesCount = await this.queryRepository.getLikesOrDislikesCount(id, 'Like')
    comment.likesInfo.dislikesCount = await this.queryRepository.getLikesOrDislikesCount(id, 'Dislike')
    return comment
  }

  async getCommentByIdWithUser (id : string, userId : string) : Promise<CommentModel | null> {
    const currentStatus = await this.likesHelper.requestType(await this.likesRepository.findStatus(id, userId))
    let comment : CommentModel | null = await this.commentsRepository.getCommentById(id)
    if (!comment) return null
    const userCommentOwnerId : string = comment.commentatorInfo.userId
    const user : UserModel | null = await this.usersRepository.getFullUser(userCommentOwnerId)
    if (!user) throw new NotFoundException()
    if (user.banInfo.isBanned === true) throw new NotFoundException()
    comment.likesInfo.myStatus = currentStatus
    comment.likesInfo.likesCount = await this.queryRepository.getLikesOrDislikesCount(id, 'Like')
    comment.likesInfo.dislikesCount = await this.queryRepository.getLikesOrDislikesCount(id, 'Dislike')
    return comment
  }
  async deleteCommentById (id: string) : Promise<boolean> {
    return this.commentsRepository.deleteCommentById(id)
  }
  async updateCommentById (content: string, id: string) : Promise <boolean> {
    return await this.commentsRepository.updateCommentById(content, id)
  }
    async createComment(postId : string, userId: string, content : string) : Promise <CommentModel | null> {
    const user : UserModel | null = await this.usersRepository.getFullUser(userId)
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
  async getLikesAndDislikesCount(commentId : string) {
    const likesCount : number = await this.likesRepository.findLikes(commentId)
    const dislikesCount : number = await this.likesRepository.findDislikes(commentId)
    return {
      likesCount : likesCount,
      dislikesCount : dislikesCount
    }
  }
}