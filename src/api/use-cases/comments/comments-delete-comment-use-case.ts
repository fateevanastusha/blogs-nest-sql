import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../public/comments/comments.repository";

export class DeleteCommentCommentsCommand {
  constructor(public content : string,public commentId : number) {}
}
@CommandHandler(DeleteCommentCommentsCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommentsCommand>{
  constructor(protected commentsRepository : CommentsRepository) {}
  async execute (command : DeleteCommentCommentsCommand) : Promise<boolean>{
    return await this.commentsRepository.updateCommentById(command.content, command.commentId)
  }
}