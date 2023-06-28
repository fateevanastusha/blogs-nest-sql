import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../public/comments/comments.repository";
import { NotFoundException } from "@nestjs/common";

export class DeleteCommentCommentsCommand {
  constructor(public commentId : number) {}
}
@CommandHandler(DeleteCommentCommentsCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommentsCommand>{
  constructor(protected commentsRepository : CommentsRepository) {}
  async execute (command : DeleteCommentCommentsCommand) : Promise<boolean>{
    const status = await this.commentsRepository.deleteCommentById(command.commentId)
    if (!status) throw new NotFoundException();
    return true
  }
}