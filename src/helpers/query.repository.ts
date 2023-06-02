import { BlogModel, PaginatedClass, BlogDocument, BlogViewModel } from "../api/public/blogs/blogs.schema";
import { QueryCommentsUsers, QueryModelBlogs, QueryModelPosts, QueryModelUsers } from "./helpers.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostDocument, PostModel } from "../api/public/posts/posts.schema";
import { UserModel, UserViewModel } from "../api/superadmin/users/users.schema";
import { CommentDocument, CommentModel } from "../api/public/comments/comments.schema";
import { LikesRepository } from "../likes/likes.repository";
import { LikeDocument, LikeViewModel } from "../likes/likes.schema";
import { UsersRepository } from "../api/superadmin/users/users.repository";

export class QueryRepository {
  constructor(@InjectModel('bloggers') private blogsModel: Model<BlogDocument>,
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
      .find({name: {$regex: query.searchNameTerm, $options: 'i'}}, {_id: 0, __v: 0, blogOwnerInfo : {_id : 0}})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(+query.pageSize)
      .lean()
  }
  async paginationForBlogsWithUser(query : QueryModelBlogs, userId : string) : Promise <BlogViewModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.blogsModel
      .find({name: {$regex: query.searchNameTerm, $options: 'i'}, 'blogOwnerInfo.userId': userId}, {_id: 0, __v: 0, blogOwnerInfo : 0})
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
  async paginatorForCommentsByPostId(query : QueryCommentsUsers, postId : string): Promise<CommentModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.commentsModel
      .find({postId : postId}, {_id: 0, __v: 0})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(+query.pageSize)
      .lean()
  }
  async paginationForUsers(query: QueryModelUsers): Promise<UserViewModel[]> {
    const skipSize: number = query.pageSize * (query.pageNumber - 1)
    return this.usersModel
      .find({
        $or: [
          {login: {$regex: query.searchLoginTerm, $options: 'i'}},
          {email: {$regex: query.searchEmailTerm, $options: 'i'}}
        ]
      }, {_id: 0, __v: 0, password : 0, confirmedCode : 0, isConfirmed : 0, banInfo : {_id : 0}})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(query.pageSize)
      .lean()
  }
  async paginationForm(pageCount: number, total: number, items: BlogModel[] | PostModel[] | UserViewModel[] | CommentModel[] | BlogViewModel[] | any, query : QueryModelBlogs): Promise<PaginatedClass> {
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
    let likesCopy = []
    let usersId = await Promise.all(likesCopy.map(async (item) => item.commentatorInfo.userId))
    let listOfBanInfo = await Promise.all(
      usersId.map(async (userId) => {
        const user = await this.usersRepository.getFullUser(userId)
        return user.banInfo.isBanned
      })
    )
    const filteredComments = newestLikes.filter((item, i) => !listOfBanInfo[i])
    return Promise.all(filteredComments.map(async like => ({
      addedAt : like.createdAt,
      userId : like.userId,
      login : await this.usersRepository.getLoginById(like.userId)
    })))
  }

  async getLikesOrDislikesCount(id : string, status : 'Like' | 'Dislike' ): Promise<number> {
    const newestLikes = await  this.likesModel.find(
      {postOrCommentId: id, $or : [{status: status} , {status: status}]})
    let usersId = await Promise.all(newestLikes.map(async (item) => item.userId))
    let listOfBanInfo = await Promise.all(
      usersId.map(async (userId) => {
        const user = await this.usersRepository.getFullUser(userId)
        return user.banInfo.isBanned
      })
    )
    const filteredComments = newestLikes.filter((item, i) => !listOfBanInfo[i])
    return filteredComments.length
  }
  async filterCommentsOfBannedUser(comments : CommentModel[]) : Promise<CommentModel[]> {
    let a = comments
    let usersId = await Promise.all(a.map(async (item) => item.commentatorInfo.userId))
    let listOfBanInfo = await Promise.all(
      usersId.map(async (userId) => {
        const user = await this.usersRepository.getFullUser(userId)
        return user.banInfo.isBanned
      })
    )
    const filteredComments = comments.filter((item, i) => !listOfBanInfo[i])
    return filteredComments
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
            likesCount: await this.getLikesOrDislikesCount(comment.id, 'Like'),
            dislikesCount: await this.getLikesOrDislikesCount(comment.id, 'Dislike'),
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
            likesCount: await this.likesModel.countDocuments({postOrCommentId : post.id, status : "Like"}),
            dislikesCount: await this.likesModel.countDocuments({postOrCommentId : post.id, status : "Dislike"}),
            myStatus: status || "None",
            newestLikes : newestLikes
          }
        }
      })
    );
  }
}