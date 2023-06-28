import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../public/comments/comments.repository";
import { CommentModel, CommentViewModel, LikesInfo } from "../../public/comments/comments.schema";
import { UserModel } from "../../superadmin/users/users.schema";
import { NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { LikesRepository } from "../../../likes/likes.repository";

export class GetCommentWithUserCommentsCommand {
  constructor(public userId : number, public commentId : number) {}
}
@CommandHandler(GetCommentWithUserCommentsCommand)
export class GetCommentWithUserUseCase implements ICommandHandler<GetCommentWithUserCommentsCommand>{
  constructor(protected commentsRepository : CommentsRepository,
              protected usersRepository : UsersRepository,
              protected likesRepository : LikesRepository) {}
  async execute (command : GetCommentWithUserCommentsCommand) : Promise<CommentViewModel>{
    const comment : CommentModel | null = await this.commentsRepository.getCommentById(command.commentId)
    if (!comment) throw new NotFoundException()
    const user : UserModel[] | null = await this.usersRepository.getFullUser(comment.userId)
    if (user.length === 0) throw new NotFoundException()
    if (user[0].isBanned === true) throw new NotFoundException()
    const likes : LikesInfo = await this.likesRepository.getLikesInfoWithUser(command.userId, command.commentId)
    const mappedComment : CommentViewModel = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: likes[0]
    }
    return mappedComment
  }
}