import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../repository/posts.repository';
import { JwtService } from '../../../utils/jwt.service';
import { LikesRepository } from '../../likes/repository/likes.repository';

export class ChangeLikeStatusPostsCommand {
  constructor(
    public requestType: string,
    public postId: string,
    public token: string,
  ) {}
}

@CommandHandler(ChangeLikeStatusPostsCommand)
export class ChangePostLikeStatusUseCase
  implements ICommandHandler<ChangeLikeStatusPostsCommand>
{
  constructor(
    protected postsRepository: PostsRepository,
    protected jwtService: JwtService,
    protected likesRepository: LikesRepository,
  ) {}
  async execute(command: ChangeLikeStatusPostsCommand): Promise<boolean> {
    await this.postsRepository.getPost(command.postId);

    const userId = await this.jwtService.getUserIdByToken(command.token);

    const foundStatus = await this.likesRepository.findStatus(
      command.postId,
      userId,
    );
    const currentStatus =
      foundStatus.length === 0 ? 'None' : foundStatus[0].status;

    if (currentStatus === command.requestType) return true;

    const status = {
      status: command.requestType,
      userId: userId,
      postOrCommentId: command.postId,
      createdAt: new Date().toISOString(),
    };

    if (currentStatus === 'None') {
      await this.likesRepository.createNewStatusForPost(status);
    } else {
      await this.likesRepository.updateStatus(status);
    }
    return true;
  }
}
