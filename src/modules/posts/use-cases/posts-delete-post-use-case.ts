import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModel } from '../../blogs/schemas/blogs.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostModel } from '../schemas/posts.schema';
import { JwtService } from '../../../utils/jwt.service';
import { PostsRepository } from '../repository/posts.repository';
import { BlogsRepository } from '../../blogs/repository/blogs.repository';

export class DeletePostPostsCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public token: string,
  ) {}
}

@CommandHandler(DeletePostPostsCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostPostsCommand>
{
  constructor(
    protected jwtService: JwtService,
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
  ) {}
  async execute(command: DeletePostPostsCommand): Promise<boolean> {
    const userId: string = await this.jwtService.getUserIdByToken(
      command.token,
    );
    const blog = await this.blogsRepository.getFullBlog(command.blogId);
    const post = await this.postsRepository.getPost(command.postId);
    if (post.blogId + '' !== command.blogId + '') throw new NotFoundException();
    if (blog.userId + '' !== userId + '') throw new ForbiddenException();
    return await this.postsRepository.deletePost(command.postId);
  }
}
