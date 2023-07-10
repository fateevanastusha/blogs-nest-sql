import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../comments/comments.repository";
import { CommentModel, CommentViewModel, LikesInfo } from "../../comments/comments.schema";
import { UserModel } from "../../users/users.schema";
import { NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../../users/users.repository";
import { LikesRepository } from "../../likes/likes.repository";

export class GetCommentWithUserCommentsCommand {
  constructor(public userId : string, public commentId : string) {}
}
@CommandHandler(GetCommentWithUserCommentsCommand)
export class GetCommentWithUserUseCase implements ICommandHandler<GetCommentWithUserCommentsCommand>{
  constructor(protected commentsRepository : CommentsRepository,
              protected usersRepository : UsersRepository,
              protected likesRepository : LikesRepository) {}
  async execute (command : GetCommentWithUserCommentsCommand) : Promise<CommentViewModel>{
    const comment : CommentModel = await this.commentsRepository.getCommentById(command.commentId)
    const user : UserModel[] | null = await this.usersRepository.getFullUser(comment.userId)
    if (user.length === 0) throw new NotFoundException()
    if (user[0].isBanned === true) throw new NotFoundException()
    const likes : LikesInfo = await this.likesRepository.getLikesInfoWithUser(command.userId, command.commentId)
    const mappedComment : CommentViewModel = {
      id: comment.id + '',
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId + '',
        userLogin: comment.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: likes[0]
    }
    return mappedComment
  }
}