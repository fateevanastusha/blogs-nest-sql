import {
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  Query,
  Req
} from "@nestjs/common";
import { Request } from "express";
import { CommandBus } from "@nestjs/cqrs";
import { GetBlogBlogsCommand } from "../use-cases/blogs-get-blog-use-case";
import { GetBlogsCommand } from '../use-cases/blogs-get-blogs-use-case';
import { GetPostsByBlogIdPostsCommand } from '../../posts/use-cases/posts-get-posts-by-blog-id-use-case';

@Controller('blogs')
export class BlogsController{
  constructor(protected commandBus : CommandBus) {}
  @Get()
  async getBlogs(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm : string){
    const query = {
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection,
      searchNameTerm : searchNameTerm
    }
    return await this.commandBus.execute(new GetBlogsCommand(query));
  }
  @Get(':id')
  async getBlog(@Param('id') blogId : string){
    if (!blogId.match(/^\d+$/)) throw new NotFoundException()
    return await this.commandBus.execute(new GetBlogBlogsCommand(blogId))
  }
  @Get(':id/posts')
  async getPosts(@Param('id') blogId : string,
                 @Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Req() req: Request
  ){
    if (!blogId.match(/^\d+$/)) throw new NotFoundException()
    const header = req.headers.authorization
    let token : string
    if (!header) {
      token = null
    } else {
      token  = header.split(" ")[1]
    }
    const query = {
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection
    }
    return await this.commandBus.execute(new GetPostsByBlogIdPostsCommand(query, blogId, token))
  }

}