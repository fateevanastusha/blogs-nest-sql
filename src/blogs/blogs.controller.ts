import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get, NotFoundException,
  Param,
  Post,
  Put,
  Query, Req,
  Res, UseGuards
} from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { BlogDto, PostsBlogDto } from "./blogs.dto";
import { PostsService } from "../posts/posts.service";
import { BlogModel, PaginatedClass } from "./blogs.schema";
import { Response, Request } from "express";
import { PostModel } from "../posts/posts.schema";
import { AuthGuard } from "../auth.guard";

@Controller('blogger/blogs')
export class BlogsController{
  constructor(protected blogsService : BlogsService,
              protected postsService : PostsService
  ) {}
  @Get()
  async getBlogs(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
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
    if(!blog) throw new NotFoundException()
    return blog
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId : string,
                   @Res() res : Response){
    const status : boolean = await this.blogsService.deleteBlog(blogId)
    if (!status) throw new NotFoundException()
    res.sendStatus(204)
    return
  }
  @UseGuards(AuthGuard)
  @Post()
  async createBlog(
    @Body() blog : BlogDto){
    const createdBlog : BlogModel | null = await this.blogsService.createBlog(blog)
    if (!createdBlog) throw new BadRequestException()
    return createdBlog
  }
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateBlog(
    @Body() blog : BlogDto,
    @Param('id') blogId : string,
    @Res() res : Response){
    const status : boolean = await this.blogsService.updateBlog(blog, blogId)
    if(!status) throw new NotFoundException()
    res.sendStatus(204)
    return
  }
  @Get(':id/posts')
  async getPosts(@Param('id') blogId : string,
                 @Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Req() req: Request
  ){
    const header = req.headers.authorization
    let token : string
    if (!header) {
      token = 'no token'
    } else {
      token  = header.split(" ")[1]
    }
    const posts : PaginatedClass | null = await this.postsService.getPostsByBlogId({
    pageSize : pageSize,
    pageNumber : pageNumber,
    sortBy : sortBy,
    sortDirection : sortDirection
  }, blogId, token)
    if (!posts) throw new NotFoundException()
    return posts
  }
  @UseGuards(AuthGuard)
  @Post(':id/posts')
  async createPost(@Param('id') blogId : string,
                   @Body() post : PostsBlogDto){
    const createdPost : PostModel | null = await this.postsService.createPost({
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: blogId
    })
      if (!createdPost) throw new NotFoundException()
      return createdPost
  }
}