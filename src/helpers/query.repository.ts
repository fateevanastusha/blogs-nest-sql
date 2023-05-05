import { BlogModel, PaginatedClass, BlogDocument } from "../blogs/blogs.schema";
import { QueryModelBlogs, QueryModelPosts, QueryModelUsers } from "./helpers.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostDocument, PostModel } from "../posts/posts.schema";
import { UserModel } from "../users/users.schema";

export class QueryRepository {
  constructor(@InjectModel('blogs') private blogsModel: Model<BlogDocument>,
              @InjectModel('posts') private postsModel: Model<PostDocument>,
              @InjectModel('users') private usersModel: Model<UserModel>) {
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
  async paginationForUsers(query: QueryModelUsers): Promise<UserModel[]> {
    const skipSize: number = query.pageSize * (query.pageNumber - 1)
    return this.usersModel
      .find({
        $or: [
          {login: {$regex: query.searchLoginTerm, $options: 'i'}},
          {email: {$regex: query.searchEmailTerm, $options: 'i'}}
        ]
      }, {_id: 0, __v: 0, password : 0, confirmedCode : 0})
      .sort({[query.sortBy]: query.sortDirection})
      .skip(skipSize)
      .limit(query.pageSize)
      .lean()
  }
  async paginationForm(pageCount: number, total: number, items: BlogModel[] | PostModel[] | UserModel[], query : QueryModelBlogs): Promise<PaginatedClass> {
    return  {
      pagesCount: pageCount,
      page: +query.pageNumber,
      pageSize: +query.pageSize,
      totalCount: total,
      items: items
    }
  }
}