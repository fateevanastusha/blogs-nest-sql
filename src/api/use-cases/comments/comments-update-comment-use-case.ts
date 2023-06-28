import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../public/comments/comments.repository";

export class UpdateCommentCommentsCommand {
  constructor(public content : string,public commentId : number) {}
}
@CommandHandler(UpdateCommentCommentsCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommentsCommand>{
  constructor(protected commentsRepository : CommentsRepository) {}
  async execute (command : UpdateCommentCommentsCommand) : Promise<boolean>{
    return await this.commentsRepository.updateCommentById(command.content, command.commentId)
  }
}