import {
  BlogModel,
  PaginatedClass,
  BlogViewModel,
  BannedUserInfo
} from "../api/public/blogs/blogs.schema";
import {
  QueryCommentsUsers,
  QueryModelBannedUsersForBlog,
  QueryModelBlogs,
  QueryModelPosts,
  QueryModelUsers
} from "./helpers.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostModel } from "../api/public/posts/posts.schema";
import { UserModel, UserViewModel } from "../api/superadmin/users/users.schema";
import { CommentModel, CommentForBloggerViewModel } from "../api/public/comments/comments.schema";
import { LikesRepository } from "../likes/likes.repository";
import { LikeDocument, LikeViewModel } from "../likes/likes.schema";
import { UsersRepository } from "../api/superadmin/users/users.repository";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class QueryRepository {
  constructor(@InjectModel('users') private usersModel: Model<UserModel>,
              @InjectModel('likes') private likesModel : Model<LikeDocument>,
              @InjectDataSource() protected dataSource : DataSource,
              protected likesRepository : LikesRepository,
              protected usersRepository : UsersRepository) {
  }
  async paginationForBlogs(query : QueryModelBlogs) : Promise <BlogModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership", "isBanned", "banDate"
        FROM public."Blogs"
        WHERE "name" LIKE '%${query.searchNameTerm}%' AND "isBanned" = false
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginationForBlogsWithAdmin(query : QueryModelBlogs) : Promise <BlogModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership", "isBanned", "banDate"
        FROM public."Blogs"
        WHERE "name" LIKE '%${query.searchNameTerm}%'
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginationForBlogsWithUser(query : QueryModelBlogs, userId : string) : Promise <BlogViewModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM public."Blogs"
        WHERE "name" LIKE '%${query.searchNameTerm}%' and "userId" = ${userId}
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginatorForPosts(query : QueryModelBlogs): Promise<PostModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT "id", "title", "shortDescription", "content", "blogName", "createdAt", "blogId"
        FROM public."Posts"
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginatorForPostsWithBlog(query : QueryModelBlogs | QueryModelPosts, id : string): Promise<PostModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT "id", "title", "shortDescription", "content", "blogName", "createdAt", "blogId"
        FROM public."Posts"
        WHERE "blogId" = ${id}
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginatorForCommentsByPostId(query : QueryCommentsUsers, postId : string): Promise<CommentModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT "id", "content", "createdAt", "blogOwnerId", "blogId", "postId", "blogName", "userId", "userLogin"
        FROM public."Comments"
        WHERE "postId" = ${postId}
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginatorForCommentsByBlogOwner(query : QueryCommentsUsers, userId : string): Promise<CommentForBloggerViewModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT "id", "content", "createdAt", "blogOwnerId", "blogId", "postId", "blogName", "userId", "userLogin"
        FROM public."Comments"
        WHERE "blogOwnerId" = ${userId}
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginationForBlogBannedUsers(query: QueryModelBannedUsersForBlog, bannedList : string[]): Promise<UserViewModel[]> {
    const skipSize: number = query.pageSize * (query.pageNumber - 1)
    return this.usersModel
      .find({id: { $in: bannedList }, login: {$regex: query.searchLoginTerm, $options: 'i'} }, {_id: 0, __v: 0, password : 0, confirmedCode : 0, isConfirmed : 0, banInfo : {_id : 0}})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(query.pageSize)
      .lean()
  }
  async paginationForUsers(query: QueryModelUsers): Promise<UserViewModel[]> {
    const skipSize: number = query.pageSize * (query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT id, email, login, "createdAt", "isBanned", "banDate", "banReason"
        FROM public."Users"
        WHERE "login" LIKE '%${query.searchLoginTerm}%' AND "email" LIKE '%${query.searchEmailTerm}%' AND "isBanned" = false
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
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
  async getLastLikesForPost(id : string): Promise<LikeViewModel[]> {
    const newestLikes = await  this.likesModel.find(
      {postOrCommentId: id, status: 'Like'},
      {_id: 0, login: 'any login', userId: 1, createdAt: 1})
      .sort({createdAt: 'desc'})
    let likesCopy = newestLikes
    let usersId = await Promise.all(likesCopy.map(async (item) => item.userId))
    let listOfBanInfo = await Promise.all(
      usersId.map(async (userId) => {
        const user = await this.usersRepository.getFullUser(userId)
        return user.isBanned
      })
    )
    const filteredComments = newestLikes.filter((item, i) => !listOfBanInfo[i]).slice(0,3)
    return Promise.all(filteredComments.map(async like => ({
      addedAt : like.createdAt,
      userId : like.userId,
      login : await this.usersRepository.getLoginById(like.userId)
    })))
  }

  async getLikesOrDislikesCount(id : string, status : 'Like' | 'Dislike' ): Promise<number> {
    const newestLikes = await this.likesModel.find(
      {postOrCommentId: id, $or : [{status: status} , {status: status}]})
    let usersId = await Promise.all(newestLikes.map(async (item) => item.userId))
    let listOfBanInfo = await Promise.all(
      usersId.map(async (userId) => {
        const user = await this.usersRepository.getFullUser(userId)
        return user.isBanned
      })
    )
    const filteredComments = newestLikes.filter((item, i) => !listOfBanInfo[i])
    return filteredComments.length
  }
  async filterCommentsOfBannedUser(comments : CommentModel[]) : Promise<CommentModel[]> {
    let a = comments
    let usersId = await Promise.all(a.map(async (item) => item.userId))
    let listOfBanInfo = await Promise.all(
      usersId.map(async (userId) => {
        const user = await this.usersRepository.getFullUser(userId)
        return user.isBanned
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
            userId: comment.userId,
            userLogin: comment.userLogin,
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

  async usersMapping(users : UserViewModel[], banInfo : BannedUserInfo[]){
    return await users.map((a) => {
      let userInfo = banInfo.find(item => item.userId === a.id)
      return
      {
        id : a.id
        login : a.login
          banInfo : {
          isBanned : userInfo.isBanned
          banDate : userInfo.banDate
          banReason : userInfo.banReason
        }
    }})
  }

  async postsMapping(posts : PostModel[], userId : string) {
    return await Promise.all(
      posts.map(async (post) => {
        let newestLikes = await this.getLastLikesForPost(post.id)
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