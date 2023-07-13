import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QueryModel } from '../../../utils/query.schemas';
import { PaginatedClass } from '../../blogs/schemas/blogs.schema';
import { PostsRepository } from '../repository/posts.repository';
import { QueryRepository } from '../../../utils/query.repository';

export class GetPostsCommand {
  constructor(public query : QueryModel) {
  }
}

@CommandHandler(GetPostsCommand)
export class GetPostsUseCase implements ICommandHandler<GetPostsCommand>{
  constructor(protected postsRepository : PostsRepository,
              protected queryRepository : QueryRepository) {}
  async execute (command : GetPostsCommand) : Promise<PaginatedClass>{
    const total : number = (await this.postsRepository.getPosts()).length
    const pageCount = Math.ceil( total / command.query.pageSize)
    const items = await this.queryRepository.paginatorForPosts(command.query)
    const paginatedItems = await this.queryRepository.postsMapping(items)
    return await this.queryRepository.paginationForm(pageCount,total,paginatedItems,command.query)
  }
}