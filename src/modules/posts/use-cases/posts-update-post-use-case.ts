import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../utils/jwt.service';
import { PostsRepository } from '../repository/posts.repository';
import { BlogsRepository } from '../../blogs/repository/blogs.repository';
import { BlogModel } from '../../blogs/schemas/blogs.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsDto } from '../dto/posts.dto';

export class UpdatePostPostsCommand {
  constructor(
    public post: PostsDto,
    public postId: string,
    public token: string,
  ) {}
}

@CommandHandler(UpdatePostPostsCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostPostsCommand>
{
  constructor(
    protected jwtService: JwtService,
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
  ) {}
  async execute(command: UpdatePostPostsCommand): Promise<boolean> {
    const userId: string = await this.jwtService.getUserIdByToken(
      command.token,
    );
    const blog = await this.blogsRepository.getFullBlog(command.post.blogId);
    if (blog.userId !== userId) throw new ForbiddenException();
    return await this.postsRepository.updatePost(command.post, command.postId);
  }
}
