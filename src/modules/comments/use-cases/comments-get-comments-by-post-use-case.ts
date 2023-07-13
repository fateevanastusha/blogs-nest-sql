import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PaginatedClass } from '../../blogs/schemas/blogs.schema';
import { CommentModel } from '../schemas/comments.schema';
import { JwtService } from '../../../utils/jwt.service';
import { CommentsRepository } from '../repository/comments.repository';
import { QueryRepository } from '../../../utils/query.repository';
import { PostsRepository } from '../../posts/repository/posts.repository';
import { QueryModel } from '../../../utils/query.schemas';

export class GetCommentsByPostCommand {
  constructor(public query : QueryModel,public header : string,public postId : string) {}
}
@CommandHandler(GetCommentsByPostCommand)
export class GetCommentsByPostUseCase implements ICommandHandler<GetCommentsByPostCommand>{
  constructor(protected jwtService : JwtService,
              protected commentsRepository : CommentsRepository,
              protected queryRepository : QueryRepository,
              protected postsRepository : PostsRepository
  ) {}
  async execute (command : GetCommentsByPostCommand) : Promise<PaginatedClass>{
    await this.postsRepository.getPost(command.postId)
    const items : CommentModel[] = await this.queryRepository.paginatorForCommentsByPostId(command.query, command.postId)
    let mappedComments
    if(command.header){
      let token = command.header.split(" ")[1]
      let userId = await this.jwtService.getUserIdByToken(token)
      mappedComments = await this.queryRepository.commentsMappingWithUser(items, userId)
    } else {
      mappedComments = await this.queryRepository.commentsMapping(items)
    }
    let total : number = await this.commentsRepository.countCommentsByPostId(command.postId)
    const pageCount : number = Math.ceil( total / command.query.pageSize)
    let paginatedComments = await this.queryRepository.paginationForm(pageCount, total, mappedComments, command.query)
    return paginatedComments
  }
}