import { PostsRepository } from "./posts.repository";
import { QueryModelPosts } from "../helpers/helpers.schema";
import { QueryRepository } from "../helpers/query.repository";
import { PostModel } from "./posts.schema";
import { BlogModel, PaginatedClass } from "../blogs/blogs.schema";
import { BlogsRepository } from "../blogs/blogs.repository";
import { PostsDto } from "./posts.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PostsService {
  constructor(protected postsRepository : PostsRepository, protected blogsRepository : BlogsRepository, protected queryRepository : QueryRepository) {
  }
  async getPosts(query : QueryModelPosts) : Promise<PaginatedClass>{
    const total : number = (await this.postsRepository.getPosts()).length
    const pageCount = Math.ceil( total / query.pageSize)
    const items = await this.queryRepository.paginatorForPosts(query)
    return await this.queryRepository.paginationForm(pageCount,total,items,query)
  }
  async getPostsByBlogId (query : QueryModelPosts, blogId: string) : Promise<PaginatedClass>{
    let total : number = await this.postsRepository.countPostsByBlogId(blogId)
    const pageCount = Math.ceil( total / query.pageSize)
    const items : PostModel[] = await this.queryRepository.paginatorForPostsWithBlog(query, blogId);
    return await this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async getPost(id: string) : Promise<null | PostModel> {
    const post =  await this.postsRepository.getPost(id)
    if (!post) return null
    return post
  }
  async deletePost(id: string) : Promise<boolean> {
    return await this.postsRepository.deletePost(id)
  }
  async createPost(post: PostsDto) : Promise <PostModel | null>{
    const blog : BlogModel | null = await this.blogsRepository.getBlog(post.blogId)
    if (!blog) return null
    const blogName = blog.name
    const newPost = {
      id: '' + (+(new Date())),
      title : post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: blogName,
      createdAt : new Date().toISOString()
    };
    const createdPost = await this.postsRepository.createPost(newPost);
    if (!createdPost) return null
    return createdPost;
  }
  async updatePost(post : PostsDto, id : string) : Promise <boolean>{
    return await this.postsRepository.updatePost(post,id)
  }
  async deleteAllData() {
    await this.postsRepository.deleteAllData();
  }
}