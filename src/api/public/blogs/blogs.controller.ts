import {
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  Query,
  Req
} from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { PostsService } from "../../public/posts/posts.service";
import { PaginatedClass } from "./blogs.schema";
import { Request } from "express";
import { CommandBus } from "@nestjs/cqrs";
import { GetBlogBlogsCommand } from "../../use-cases/blogs/blogs-get-blog-use-case";

@Controller('blogs')
export class BlogsController{
  constructor(protected blogsService : BlogsService,
              protected postsService : PostsService,
              protected commandBus : CommandBus
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
  async getBlog(@Param('id') blogId : number){
    return await this.commandBus.execute(new GetBlogBlogsCommand(blogId))
  }
  @Get(':id/posts')
  async getPosts(@Param('id') blogId : number,
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

}