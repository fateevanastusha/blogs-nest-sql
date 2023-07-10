import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QueryModelComments } from '../../../helpers/helpers.schema';
import { PaginatedClass } from '../../blogs/blogs.schema';
import { CommentModel } from '../../comments/comments.schema';
import { JwtService } from '../../../jwt.service';
import { CommentsRepository } from '../../comments/comments.repository';
import { QueryRepository } from '../../../helpers/query.repository';
import { LikesRepository } from '../../likes/likes.repository';
import { PostsRepository } from '../../posts/posts.repository';

export class GetCommentsByBlogCommand {
  constructor(public query : QueryModelComments,public token : string) {}
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