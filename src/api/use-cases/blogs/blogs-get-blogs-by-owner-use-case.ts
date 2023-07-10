import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../blogs/blogs.repository";
import { BlogViewModel, PaginatedClass } from '../../blogs/blogs.schema';
import { QueryModelBlogs } from '../../../helpers/helpers.schema';
import { JwtService } from '../../../jwt.service';
import { QueryRepository } from '../../../helpers/query.repository';


export class GetBlogsByOwnerBlogsCommand {
  constructor(public query : QueryModelBlogs,public token : string) {}
}
@CommandHandler(GetBlogsByOwnerBlogsCommand)
export class GetBlogsByOwnerUseCase implements ICommandHandler<GetBlogsByOwnerBlogsCommand>{
  constructor(protected jwtService : JwtService,
              protected blogsRepository : BlogsRepository,
              protected queryRepository : QueryRepository
              ) {}
  async execute (command : GetBlogsByOwnerBlogsCommand) : Promise<PaginatedClass>{
    const userId = await this.jwtService.getUserIdByToken(command.token)
    const total = await this.blogsRepository.getBlogsCountWithUser(command.query.searchNameTerm, userId)
    const pageCount = Math.ceil( total / +command.query.pageSize)
    const items : BlogViewModel[] = await this.queryRepository.paginationForBlogsWithUser(command.query, userId);
    const mappedItems : BlogViewModel[]= items.map(a => {
      return {
        createdAt : a.createdAt,
        isMembership : a.isMembership,
        description : a.description,
        name : a.name,
        websiteUrl : a.websiteUrl,
        id : a.id + ''
      }
    })
    return await this.queryRepository.paginationForm(pageCount, total, mappedItems, command.query)
  }
}