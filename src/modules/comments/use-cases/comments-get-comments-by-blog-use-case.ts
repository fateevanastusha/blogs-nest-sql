import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PaginatedClass } from '../../blogs/schemas/blogs.schema';
import { CommentModel } from '../schemas/comments.schema';
import { JwtService } from '../../../utils/jwt.service';
import { CommentsRepository } from '../repository/comments.repository';
import { QueryRepository } from '../../../utils/query.repository';
import { LikesRepository } from '../../likes/repository/likes.repository';
import { PostsRepository } from '../../posts/repository/posts.repository';
import { QueryModel } from '../../../utils/query.schemas';

export class GetCommentsByBlogCommand {
  constructor(public query : QueryModel,public token : string) {}
}
@CommandHandler(GetCommentsByBlogCommand)
export class GetCommentsByBlogUseCase implements ICommandHandler<GetCommentsByBlogCommand>{
  constructor(protected jwtService : JwtService,
              protected commentsRepository : CommentsRepository,
              protected queryRepository : QueryRepository,
              protected likesRepository : LikesRepository,
              protected postsRepository : PostsRepository
              ) {}
  async execute (command : GetCommentsByBlogCommand) : Promise<PaginatedClass>{
    const userId = await this.jwtService.getUserIdByToken(command.token)
    const total = await this.commentsRepository.getCommentsCountByBlogOwnerId(userId)
    const pageCount = Math.ceil( total / +command.query.pageSize)
    const items : CommentModel[] = await this.queryRepository.paginatorForCommentsByBlogOwner(command.query, userId)
    const mappedItems = await Promise.all(items.map(async (a) => {
      let likes = (await this.likesRepository.getLikesInfoWithUser(userId, a.id))[0]
      let postTitle = (await this.postsRepository.getPost(a.postId)).title
      return {
        id: a.id + '',
        content: a.content,
        commentatorInfo: {
          userId: a.userId + '',
          userLogin: a.userLogin
        },
        createdAt: a.createdAt,
        postInfo: {
          blogId: a.blogId + '',
          blogName: a.blogName,
          id: a.postId + '',
          title: postTitle
        },
        likesInfo : {...likes}
      }
    }))
    return await this.queryRepository.paginationForm(pageCount,total,mappedItems, command.query)
  }
}