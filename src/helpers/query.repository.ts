import {
  BlogModel,
  PaginatedClass,
  BlogViewModel, BannedUserInfo
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
import { LikeDocument } from "../likes/likes.schema";
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
    SELECT *
        FROM public."Blogs"
        WHERE "name" LIKE '%' || CASE WHEN '${query.searchNameTerm}' = '' THEN '' ELSE '${query.searchNameTerm}' END || '%' 
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
        WHERE "name" LIKE '%${query.searchNameTerm}%'
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginationForBlogsWithUser(query : QueryModelBlogs, userId : number) : Promise <BlogViewModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM public."Blogs"
        WHERE "name" LIKE '%${query.searchNameTerm}%' AND "userId" = ${userId} AND "isBanned" = false
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
  async paginatorForPostsWithBlog(query : QueryModelBlogs | QueryModelPosts, id : number): Promise<PostModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT "id", "title", "shortDescription", "content", "blogName", "createdAt", "blogId"
        FROM public."Posts"
        WHERE "blogId" = ${id}
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginatorForCommentsByPostId(query : QueryCommentsUsers, postId : number): Promise<CommentModel[]> {
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
  async paginatorForCommentsByBlogOwner(query : QueryCommentsUsers, userId : number): Promise<CommentModel[]> {
    const skipSize: number = +query.pageSize * (+query.pageNumber - 1)
    return this.dataSource.query(`
    SELECT *
        FROM public."Comments"
        WHERE "blogOwnerId" = ${userId}
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        OFFSET ${skipSize} LIMIT ${query.pageSize};
    `)
  }
  async paginationForBlogBannedUsers(query: QueryModelBannedUsersForBlog, blogId : number): Promise<BannedUserInfo[]> {
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
            WHERE "login" LIKE '%${query.searchLoginTerm}%' AND "email" LIKE '%${query.searchEmailTerm}%' 
            ORDER BY "${query.sortBy}" ${query.sortDirection}
            OFFSET ${skipSize} LIMIT ${query.pageSize};
        `)
    }
    else {
      return this.dataSource.query(`
        SELECT "id", "email", "login", "createdAt", "isBanned", "banDate", "banReason"
            FROM public."Users"
            WHERE "login" LIKE '%${query.searchLoginTerm}%' AND "email" LIKE '%${query.searchEmailTerm}%' AND "isBanned" = ${query.banStatus}
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

  async commentsMappingWithUser(comments : CommentModel[], userId : number){
    return await Promise.all(
      comments.map(async (comment) => {
        let likesInfo = await this.likesRepository.getLikesInfoWithUser(userId, comment.id)
        return {
          commentatorInfo : {
            userId : comment.userId,
            userLogin : comment.userLogin
          },
          content : comment.content,
          createdAt : comment.createdAt,
          id : comment.id,
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
            userId : comment.userId,
            userLogin : comment.userLogin
          },
          content : comment.content,
          createdAt : comment.createdAt,
          id : comment.id,
          likesInfo : {
            likesCount : likesInfo.likesCount,
            dislikesCount : likesInfo.dislikesCount,
            myStatus : 'None'
          }
        }
      })
    )
  }

  async postsMapping(posts : PostModel[], userId : number) {
    return await Promise.all(
      posts.map(async (post) => {
        let newestLikes = await this.likesRepository.getLastLikes(post.id)
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