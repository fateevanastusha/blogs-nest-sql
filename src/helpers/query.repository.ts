import { BlogModel, PaginatedClass, BlogDocument } from "../blogs/blogs.schema";
import { QueryCommentsUsers, QueryModelBlogs, QueryModelPosts, QueryModelUsers } from "./helpers.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostDocument, PostModel } from "../posts/posts.schema";
import { UserModel } from "../users/users.schema";
import { CommentDocument, CommentModel } from "../comments/comments.schema";
import { LikesRepository } from "../likes/likes.repository";
import { LikeDocument, LikeModel, LikeViewModel } from "../likes/likes.schema";
import { UsersRepository } from "../users/users.repository";

export class QueryRepository {
  constructor(@InjectModel('blogs') private blogsModel: Model<BlogDocument>,
              @InjectModel('posts') private postsModel: Model<PostDocument>,
              @InjectModel('users') private usersModel: Model<UserModel>,
              @InjectModel('comments') private commentsModel : Model<CommentDocument>,
              @InjectModel('likes') private likesModel : Model<LikeDocument>,
              protected likesRepository : LikesRepository,
              protected usersRepository : UsersRepository) {
  }
  async paginationForBlogs(query : QueryModelBlogs) : Promise <BlogModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.blogsModel
      .find({name: {$regex: query.searchNameTerm, $options: 'i'}}, {_id: 0, __v: 0})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(+query.pageSize)
      .lean()
  }
  async paginatorForPosts(query : QueryModelBlogs): Promise<PostModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.postsModel
      .find({},{_id: 0, __v: 0, 'extendedLikesInfo' : {_id : 0}})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(+query.pageSize)
      .lean()
  }
  async paginatorForPostsWithBlog(query : QueryModelBlogs | QueryModelPosts, id : string): Promise<PostModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.postsModel
      .find({blogId: id},{_id: 0, __v: 0, 'extendedLikesInfo' : {_id : 0}})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(+query.pageSize)
      .lean()
  }
  async paginatorForCommentsByBlogId(query : QueryCommentsUsers, postId : string): Promise<CommentModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.commentsModel
      .find({postId : postId}, {_id: 0, __v: 0})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(+query.pageSize)
      .lean()
  }
  async paginationForUsers(query: QueryModelUsers): Promise<UserModel[]> {
    const skipSize: number = query.pageSize * (query.pageNumber - 1)
    return this.usersModel
      .find({
        $or: [
          {login: {$regex: query.searchLoginTerm, $options: 'i'}},
          {email: {$regex: query.searchEmailTerm, $options: 'i'}}
        ]
      }, {_id: 0, __v: 0, password : 0, confirmedCode : 0, isConfirmed : 0})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(query.pageSize)
      .lean()
  }
  async paginationForm(pageCount: number, total: number, items: BlogModel[] | PostModel[] | UserModel[] | CommentModel[] | any, query : QueryModelBlogs): Promise<PaginatedClass> {
    return  {
      pagesCount: pageCount,
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: total,
      items: items
    }
  }
  async getLastLikes(id : string): Promise<LikeViewModel[]> {
    const newestLikes = await  this.likesModel.find(
      {postOrCommentId: id, status: 'Like'},
      {_id: 0, login: 'any login', userId: 1, createdAt: 1})
      .sort({createdAt: 'desc'})
      .limit(3)
    return Promise.all(newestLikes.map(async like => ({
      addedAt : like.createdAt,
      userId : like.userId,
      login : await this.usersRepository.getLoginById(like.userId)
    })))
  }

  async commentsMapping(comments : CommentModel[], userId : string) {
    return Promise.all(
      comments.map(async (comment) => {

        let status = null;

        if (userId) {
          status = await this.likesRepository.findStatus(comment.id, userId);
          if (status) status = status.status
        }

        return {
          id: comment.id,
          content: comment.content,
          commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin,
          },
          createdAt: comment.createdAt,
          likesInfo: {
            likesCount: comment.likesInfo.likesCount,
            dislikesCount: comment.likesInfo.dislikesCount,
            myStatus: status || "None",
          },
        };
      })
    );
  }

  //PAGINATION FOR POSTS

  async postsMapping(posts : PostModel[], userId : string) {
    return await Promise.all(
      posts.map(async (post) => {
        let newestLikes = await this.getLastLikes(post.id)
        let status = null;
        if (userId) {
          status = await this.likesRepository.findStatus(post.id, userId);
          if (status) status = status.status
        }
        return {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: status || "None",
            newestLikes : newestLikes
          }
        }
      })
    );
  }
}