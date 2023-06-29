import { QueryModelBlogs, QueryModelComments } from "../../../helpers/helpers.schema";
import { Injectable } from "@nestjs/common";
import { BlogViewModel, PaginatedClass } from "../../public/blogs/blogs.schema";
import { QueryRepository } from "../../../helpers/query.repository";
import { JwtService } from "../../../jwt.service";
import { CommentsRepository } from "../../public/comments/comments.repository";
import { CommentModel } from "../../public/comments/comments.schema";
import { LikesRepository } from "../../../likes/likes.repository";
import { PostsRepository } from "../../public/posts/posts.repository";
import { BlogsRepository } from "../../public/blogs/blogs.repository";

@Injectable()
export class BloggersService {
  constructor(protected blogsRepository : BlogsRepository,
              protected queryRepository : QueryRepository,
              protected likesRepository : LikesRepository,
              protected commentsRepository : CommentsRepository,
              protected jwtService : JwtService,
              protected postsRepository : PostsRepository) {}
  async getBlogs(query : QueryModelBlogs, token : string): Promise<PaginatedClass>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const total = await this.blogsRepository.getBlogsCountWithUser(query.searchNameTerm, userId)
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : BlogViewModel[] = await this.queryRepository.paginationForBlogsWithUser(query, userId);
    return await this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async getComments(query : QueryModelComments, token : string): Promise<PaginatedClass>{
    const userId = await this.jwtService.getUserIdByToken(token)
    const total = await this.commentsRepository.getCommentsCountByBlogOwnerId(userId)
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : CommentModel[] = await this.queryRepository.paginatorForCommentsByBlogOwner(query, userId)
    const mappedItems = await Promise.all(items.map(async (a) => {
      let likes = (await this.likesRepository.getLikesInfoWithUser(userId, a.id))[0]
      let postTitle = (await this.postsRepository.getPost(a.postId))[0].title
      return {
        id: a.id,
        content: a.content,
        commentatorInfo: {
          userId: a.userId,
          userLogin: a.userLogin
        },
        createdAt: a.createdAt,
        postInfo: {
          blogId: a.blogId,
          blogName: a.blogName,
          id: a.postId,
          title: postTitle
        },
        likesInfo : {...likes}
      }
    }))
    return await this.queryRepository.paginationForm(pageCount,total,mappedItems,query)
  }
}