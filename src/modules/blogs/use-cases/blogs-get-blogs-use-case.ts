import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../repository/blogs.repository";
import { BlogModel, PaginatedClass } from '../schemas/blogs.schema';
import { QueryModelBlogs } from '../../../utils/query.schemas';
import { JwtService } from '../../../utils/jwt.service';
import { QueryRepository } from '../../../utils/query.repository';


export class GetBlogsCommand {
  constructor(public query : QueryModelBlogs) {}
}
@CommandHandler(GetBlogsCommand)
export class GetBlogsUseCase implements ICommandHandler<GetBlogsCommand>{
  constructor(protected jwtService : JwtService,
              protected blogsRepository : BlogsRepository,
              protected queryRepository : QueryRepository
  ) {}
  async execute (command : GetBlogsCommand) : Promise<PaginatedClass>{
    const total = await this.blogsRepository.getBlogsCount(command.query.searchNameTerm)
    const pageCount = Math.ceil( total / +command.query.pageSize)
    const items : BlogModel[] = await this.queryRepository.paginationForBlogs(command.query);
    const mappedItems = items.map(a => {
      return {
        createdAt: a.createdAt,
        description: a.description,
        id: a.id + '',
        isMembership: a.isMembership,
        name: a.name,
        websiteUrl: a.websiteUrl
      }
    })
    return await this.queryRepository.paginationForm(pageCount, total, mappedItems, command.query)
  }
}