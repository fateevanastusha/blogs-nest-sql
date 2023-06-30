import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../public/comments/comments.repository";
import { NotFoundException } from "@nestjs/common";

export class UpdateCommentCommentsCommand {
  constructor(public content : string,public commentId : string) {}
}
@CommandHandler(UpdateCommentCommentsCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommentsCommand>{
  constructor(protected commentsRepository : CommentsRepository) {}
  async execute (command : UpdateCommentCommentsCommand) : Promise<boolean>{
    const status : boolean = await this.commentsRepository.updateCommentById(command.content, command.commentId)
    if(!status) throw new NotFoundException()
    return true
  }
}