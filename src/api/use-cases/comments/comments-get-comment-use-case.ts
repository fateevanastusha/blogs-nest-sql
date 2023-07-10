import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../comments/comments.repository";
import { CommentModel, CommentViewModel, LikesInfo } from "../../comments/comments.schema";
import { NotFoundException } from "@nestjs/common";
import { UserModel } from "../../users/users.schema";
import { UsersRepository } from "../../users/users.repository";
import { LikesRepository } from "../../../likes/likes.repository";

export class GetCommentCommentsCommand {
  constructor(public commentId : string) {}
}
@CommandHandler(GetCommentCommentsCommand)
export class GetCommentUseCase implements ICommandHandler<GetCommentCommentsCommand>{
  constructor(protected commentsRepository : CommentsRepository,
              protected usersRepository : UsersRepository,
              protected likesRepository : LikesRepository) {}
  async execute (command : GetCommentCommentsCommand) : Promise<CommentViewModel>{
    const comment : CommentModel = await this.commentsRepository.getCommentById(command.commentId)
    const user : UserModel[] | null = await this.usersRepository.getFullUser(comment.userId)
    if (user.length === 0) throw new NotFoundException()
    if (user[0].isBanned === true) throw new NotFoundException()
    const likes : LikesInfo = (await this.likesRepository.getLikesInfo(command.commentId))[0]
    const mappedComment : CommentViewModel = {
      id: comment.id + '',
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId + '',
        userLogin: comment.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount : likes.likesCount,
        dislikesCount : likes.dislikesCount,
        myStatus : "None"
      }
    }
    return mappedComment
  }
}