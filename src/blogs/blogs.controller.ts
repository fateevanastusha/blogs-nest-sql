import { Body, Controller, DefaultValuePipe, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { BlogDto } from "./blogs.dto";
import { PostsService } from "../posts/posts.service";
import { PostsDto } from "../posts/posts.dto";
import { BlogModel } from "./blogs.schema";
import { ErrorCodes, errorHandler } from "../helpers/errors";
@Controller('blogs')
export class BlogsController{
  constructor(protected blogsService : BlogsService,
              protected postsService : PostsService
  ) {}
  @Get()
  async getBlogs(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('asc')) sortDirection : "asc" | "desc",
                 @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm : string){
    return await this.blogsService.getBlogs({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection,
      searchNameTerm : searchNameTerm
    })
  }
  @Get(':id')
  async getBlog(@Param('id') blogId : string
  ){
    const blog : BlogModel | null = await this.blogsService.getBlog(blogId)
    if(!blog) return errorHandler(ErrorCodes.NotFound);
    return blog
  }
  @Delete(':id')
  async deleteBlog(@Param('id') blogId : string){
    return await this.blogsService.deleteBlog(blogId)
  }
  @Post()
  async createBlog(
    @Body() blog : BlogDto){
    return await this.blogsService.createBlog(blog)
  }
  @Put(':id')
  async updateBlog(
    @Body() blog : BlogDto,
    @Param('id') blogId : string){
    return await this.blogsService.updateBlog(blog, blogId)
  }
  @Get(':id')
  async getPosts(@Param('id') blogId : string,
                 @Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('asc')) sortDirection : "asc" | "desc",
  ){
  return await this.postsService.getPostsByBlogId({
    pageSize : pageSize,
    pageNumber : pageNumber,
    sortBy : sortBy,
    sortDirection : sortDirection
  }, blogId)
  }
  @Post(':id')
  async createPost(@Param('id') blogId : string,
                   @Body() post : PostsDto){
  return await this.postsService.createPost({
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: blogId
  })
  }
}