import { Body, Controller, DefaultValuePipe, Delete, Get, Param, Post, Put, Query, Res } from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { BlogDto } from "./blogs.dto";
import { PostsService } from "../posts/posts.service";
import { PostsDto } from "../posts/posts.dto";
import { BlogModel, PaginatedClass } from "./blogs.schema";
import { ErrorCodes, errorHandler } from "../helpers/errors";
import { Response } from "express";
import { PostModel } from "../posts/posts.schema";

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
  async deleteBlog(@Param('id') blogId : string,
                   @Res() res : Response){
    const status : boolean = await this.blogsService.deleteBlog(blogId)
    if (!status) return errorHandler(ErrorCodes.NotFound)
    res.sendStatus(204)
    return
  }
  @Post()
  async createBlog(
    @Body() blog : BlogDto){
    const createdBlog : BlogModel | null = await this.blogsService.createBlog(blog)
    if (!createdBlog) return errorHandler(ErrorCodes.BadRequest)
    return createdBlog
  }
  @Put(':id')
  async updateBlog(
    @Body() blog : BlogDto,
    @Param('id') blogId : string,
    @Res() res : Response){
    const status : boolean = await this.blogsService.updateBlog(blog, blogId)
    if(!status) return errorHandler(ErrorCodes.NotFound)
    res.sendStatus(204)
    return
  }
  @Get(':id/posts')
  async getPosts(@Param('id') blogId : string,
                 @Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('asc')) sortDirection : "asc" | "desc",
  ){
  const posts : PaginatedClass | null = await this.postsService.getPostsByBlogId({
    pageSize : pageSize,
    pageNumber : pageNumber,
    sortBy : sortBy,
    sortDirection : sortDirection
  }, blogId)
    if (!posts) return errorHandler(ErrorCodes.NotFound)
    return posts
  }
  @Post(':id/posts')
  async createPost(@Param('id') blogId : string,
                   @Body() post : PostsDto){
  const status : PostModel | null = await this.postsService.createPost({
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: blogId
  })
    if (!status) return errorHandler(ErrorCodes.BadRequest)
    return
  }
}