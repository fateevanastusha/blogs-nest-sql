import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../comments/comments.repository";
import { CommentModel } from "../../comments/comments.schema";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { LikesRepository } from "../../../likes/likes.repository";

export class LikeCommentCommentsCommand {
  constructor(public requestType : string,public commentId : string,public userId : string) {}
}
@CommandHandler(LikeCommentCommentsCommand)
export class LikeCommentUseCase implements ICommandHandler<LikeCommentCommentsCommand>{
  constructor(protected commentsRepository : CommentsRepository,
              protected likesRepository : LikesRepository) {}
  async execute (command : LikeCommentCommentsCommand) : Promise<boolean>{
    await this.commentsRepository.getCommentById(command.commentId)
    const currentStatus = await this.likesRepository.findStatus(command.commentId, command.userId)
    const newStatus = {
      status : command.requestType,
      userId : command.userId,
      postOrCommentId : command.commentId,
      createdAt : new Date().toISOString()
    }
    if(currentStatus.length === 0){
      const statusOfCreateRequest = await this.likesRepository.createNewStatusForComment(newStatus)
      if(!statusOfCreateRequest) throw new BadRequestException()
      return true
    } else {
      const statusOfUpdateRequest = await this.likesRepository.updateStatus(newStatus)
      if(!statusOfUpdateRequest) throw new BadRequestException()
    }
    return true
  }
}