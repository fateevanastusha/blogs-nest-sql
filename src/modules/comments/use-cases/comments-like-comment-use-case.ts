import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../repository/comments.repository";
import { CommentModel } from "../schemas/comments.schema";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { LikesRepository } from "../../likes/repository/likes.repository";

export class ChangeLikeStatusCommentsCommand {
  constructor(public requestType : string,public commentId : string,public userId : string) {}
}
@CommandHandler(ChangeLikeStatusCommentsCommand)
export class LikeCommentUseCase implements ICommandHandler<ChangeLikeStatusCommentsCommand>{
  constructor(protected commentsRepository : CommentsRepository,
              protected likesRepository : LikesRepository) {}
  async execute (command : ChangeLikeStatusCommentsCommand) : Promise<boolean>{

    await this.commentsRepository.getCommentById(command.commentId)

    const foundStatus = await this.likesRepository.findStatus(command.commentId, command.userId)
    const currentStatus = foundStatus.length === 0 ? 'None' : foundStatus[0].status

    if (currentStatus === command.requestType) return true

    const newStatus = {
      status : command.requestType,
      userId : command.userId,
      postOrCommentId : command.commentId,
      createdAt : new Date().toISOString()
    }

    if (currentStatus === "None"){
      await this.likesRepository.createNewStatusForComment(newStatus)
    } else {
      await this.likesRepository.updateStatus(newStatus)
    }
    return true
  }
}