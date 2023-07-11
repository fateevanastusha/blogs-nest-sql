import {
  BlogModel,
  PaginatedClass,
  BlogViewModel, BannedUserInfo
} from "../api/blogs/blogs.schema";
import {
  QueryCommentsUsers,
  QueryModelBannedUsersForBlog,
  QueryModelBlogs,
  QueryModelPosts,
  QueryModelUsers
} from "./helpers.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostModel } from "../api/posts/posts.schema";
import { UserModel, UserViewModel } from "../api/users/users.schema";
import { CommentModel } from "../api/comments/comments.schema";
import { LikesRepository } from "../api/likes/likes.repository";
import { LikeDocument } from "../api/likes/likes.schema";
import { UsersRepository } from "../api/users/users.repository";
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
    SELECT *
        FROM public."Blogs"
        WHERE "name" ILIKE '%' || CASE WHEN '${query.searchNameTerm}' = '' THEN '' ELSE '${query.searchNameTerm}' END || '%' 
        AND "isBanned" = false
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginationForBlogsWithAdmin(query : QueryModelBlogs) : Promise <BlogModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT *
        FROM public."Blogs"
        WHERE "name" ILIKE '%' || CASE WHEN '${query.searchNameTerm}' = '' THEN '' ELSE '${query.searchNameTerm}' END || '%'
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginationForBlogsWithUser(query : QueryModelBlogs, userId : string) : Promise <BlogViewModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return await this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM public."Blogs"
        WHERE "name" ILIKE '%${query.searchNameTerm}%' AND "userId" = ${userId} AND "isBanned" = false
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
      SELECT c.*
        FROM public."Comments" c
        JOIN public."Users" u ON c."userId" = u."id"
        WHERE c."postId" = ${postId} AND u."isBanned" = false
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginatorForCommentsByBlogOwner(query : QueryCommentsUsers, userId : string): Promise<CommentModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT *
        FROM public."Comments"
        WHERE "blogOwnerId" = ${userId}
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginationForBlogBannedUsers(query: QueryModelBannedUsersForBlog, blogId : string): Promise<BannedUserInfo[]> {
    const skipSize: number = query.pageSize * (query.pageNumber - 1)
    return this.dataSource.query(`
      SELECT *
          FROM public."BannedForBlogUser"
          WHERE "blogId" = ${blogId}
          ORDER BY "${query.sortBy}" ${query.sortDirection}
          OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginationForUsers(query: QueryModelUsers): Promise<UserModel[]> {
    const skipSize: number = query.pageSize * (query.pageNumber - 1)
    if(query.banStatus === undefined){
      return this.dataSource.query(`
        SELECT "id", "email", "login", "createdAt", "isBanned", "banDate", "banReason"
            FROM public."Users"
            WHERE "login" ILIKE '%${query.searchLoginTerm}%' OR "email" ILIKE '%${query.searchEmailTerm}%' 
            ORDER BY "${query.sortBy}" ${query.sortDirection}
            OFFSET ${skipSize} LIMIT ${query.pageSize};
        `)
    }
    else {
      return this.dataSource.query(`
        SELECT "id", "email", "login", "createdAt", "isBanned", "banDate", "banReason"
            FROM public."Users"
            WHERE ("login" ILIKE '%${query.searchLoginTerm}%' OR "email" ILIKE '%${query.searchEmailTerm}%') AND "isBanned" = ${query.banStatus}
            ORDER BY "${query.sortBy}" ${query.sortDirection}
            OFFSET ${skipSize} LIMIT ${query.pageSize};
        `)
    }
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

  async commentsMappingWithUser(comments : CommentModel[], userId : string){
    return await Promise.all(
      comments.map(async (comment) => {
        let likesInfo = await this.likesRepository.getLikesInfoWithUser(userId, comment.id)
        return {
          commentatorInfo : {
            userId : comment.userId + '',
            userLogin : comment.userLogin
          },
          content : comment.content,
          createdAt : comment.createdAt,
          id : comment.id + '',
          likesInfo : { ...likesInfo[0] }
        }
      })
    )
  }

  async commentsMapping(comments : CommentModel[]){
    return await Promise.all(
      comments.map(async (comment) => {
        let likesInfo = (await this.likesRepository.getLikesInfo(comment.id))[0]
        return {
          commentatorInfo : {
            userId : comment.userId + '',
            userLogin : comment.userLogin
          },
          content : comment.content,
          createdAt : comment.createdAt,
          id : comment.id + '',
          likesInfo : {
            likesCount : likesInfo.likesCount,
            dislikesCount : likesInfo.dislikesCount,
            myStatus : 'None'
          }
        }
      })
    )
  }

  async postsMapping(posts : PostModel[]) {
    return await Promise.all(
      posts.map(async (post) => {
        let newestLikes = await this.likesRepository.getLastLikes(post.id)
        return {
          id: post.id + '',
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId + '',
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: await this.likesModel.countDocuments({postOrCommentId : post.id, status : "Like"}),
            dislikesCount: await this.likesModel.countDocuments({postOrCommentId : post.id, status : "Dislike"}),
            myStatus: "None",
            newestLikes : newestLikes
          }
        }
      })
    );
  }
  async postsMappingWithUser(posts : PostModel[], userId : string) {
    return await Promise.all(
      posts.map(async (post) => {
        let newestLikes = await this.likesRepository.getLastLikes(post.id)
        let currentStatus = await this.likesRepository.findStatus(post.id, userId);
        let status
        if(currentStatus.length > 0) status = currentStatus[0].status
        return {
          id: post.id + '',
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId + '',
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: await this.likesModel.countDocuments({postOrCommentId : post.id, status : "Like"}),
            dislikesCount: await this.likesModel.countDocuments({postOrCommentId : post.id, status : "Dislike"}),
            myStatus: status,
            newestLikes : newestLikes
          }
        }
      })
    );
  }
}