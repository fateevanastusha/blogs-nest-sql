import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QueryModel } from '../../../utils/query.schemas';
import { PaginatedClass } from '../../blogs/schemas/blogs.schema';
import { PostModel } from '../schemas/posts.schema';
import { JwtService } from '../../../utils/jwt.service';
import { BlogsRepository } from '../../blogs/repository/blogs.repository';
import { QueryRepository } from '../../../utils/query.repository';
import { PostsRepository } from '../repository/posts.repository';

export class GetPostsByBlogIdPostsCommand {
  constructor(
    public query: QueryModel,
    public blogId: string,
    public token: string | null,
  ) {}
}

@CommandHandler(GetPostsByBlogIdPostsCommand)
export class GetPostsByBlogIdUseCase
  implements ICommandHandler<GetPostsByBlogIdPostsCommand>
{
  constructor(
    protected jwtService: JwtService,
    protected blogsRepository: BlogsRepository,
    protected queryRepository: QueryRepository,
    protected postsRepository: PostsRepository,
  ) {}
  async execute(
    command: GetPostsByBlogIdPostsCommand,
  ): Promise<PaginatedClass> {
    const userId = await this.jwtService.getUserIdByToken(command.token);
    const blog = await this.blogsRepository.getFullBlog(command.blogId);
    let total: number = await this.postsRepository.countPostsByBlogId(
      command.blogId,
    );
    let pageCount = Math.ceil(total / command.query.pageSize);
    let items: PostModel[] =
      await this.queryRepository.paginatorForPostsWithBlog(
        command.query,
        command.blogId,
      );
    if (blog.isBanned) {
      items = [];
      total = 0;
      pageCount = 0;
    }
    let paginatedPosts: PostModel[];
    if (!command.token) {
      paginatedPosts = await this.queryRepository.postsMapping(items);
    } else {
      paginatedPosts = await this.queryRepository.postsMappingWithUser(
        items,
        userId,
      );
    }
    return await this.queryRepository.paginationForm(
      pageCount,
      total,
      paginatedPosts,
      command.query,
    );
  }
}
