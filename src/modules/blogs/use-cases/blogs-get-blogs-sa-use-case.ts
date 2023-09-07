import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../repository/blogs.repository';
import { BlogModel, PaginatedClass } from '../schemas/blogs.schema';
import { QueryModelBlogs } from '../../../utils/query.schemas';
import { JwtService } from '../../../utils/jwt.service';
import { QueryRepository } from '../../../utils/query.repository';

export class GetBlogsSaBlogsCommand {
  constructor(public query: QueryModelBlogs) {}
}
@CommandHandler(GetBlogsSaBlogsCommand)
export class GetBlogsSaUseCase
  implements ICommandHandler<GetBlogsSaBlogsCommand>
{
  constructor(
    protected jwtService: JwtService,
    protected blogsRepository: BlogsRepository,
    protected queryRepository: QueryRepository,
  ) {}
  async execute(command: GetBlogsSaBlogsCommand): Promise<PaginatedClass> {
    let total = await this.blogsRepository.getBlogsCount(
      command.query.searchNameTerm,
    );
    if (!total) total = 0;
    const pageCount = Math.ceil(total / +command.query.pageSize);
    const items: BlogModel[] =
      await this.queryRepository.paginationForBlogsWithAdmin(command.query);
    const mappedItems = items.map((a) => {
      return {
        name: a.name,
        description: a.description,
        websiteUrl: a.websiteUrl,
        id: a.id + '',
        createdAt: a.createdAt,
        isMembership: a.isMembership,
        banInfo: {
          banDate: a.banDate,
          isBanned: a.isBanned,
        },
        blogOwnerInfo: {
          userId: a.userId + '',
          userLogin: a.userLogin,
        },
      };
    });
    return await this.queryRepository.paginationForm(
      pageCount,
      total,
      mappedItems,
      command.query,
    );
  }
}
