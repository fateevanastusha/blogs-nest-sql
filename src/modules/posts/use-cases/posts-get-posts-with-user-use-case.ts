import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PaginatedClass } from '../../blogs/schemas/blogs.schema';
import { QueryModel } from '../../../utils/query.schemas';
import { JwtService } from '../../../utils/jwt.service';
import { PostsRepository } from '../repository/posts.repository';
import { QueryRepository } from '../../../utils/query.repository';

export class GetPostsWithUserCommand {
  constructor(public query : QueryModel, public token : string) {
  }
}

@CommandHandler(GetPostsWithUserCommand)
export class GetPostsWithUserUseCase implements ICommandHandler<GetPostsWithUserCommand>{
  constructor(protected jwtService : JwtService,
              protected postsRepository : PostsRepository,
              protected queryRepository : QueryRepository
              ) {}
  async execute (command : GetPostsWithUserCommand) : Promise<PaginatedClass>{
    const userId : string = await this.jwtService.getUserIdByToken(command.token)
    const total : number = (await this.postsRepository.getPosts()).length
    const pageCount = Math.ceil( total / command.query.pageSize)
    const items = await this.queryRepository.paginatorForPosts(command.query)
    const paginatedItems = await this.queryRepository.postsMappingWithUser(items, userId)
    return await this.queryRepository.paginationForm(pageCount,total,paginatedItems,command.query)
  }
}