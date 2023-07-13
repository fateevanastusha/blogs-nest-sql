import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { BlogDto, PostsBlogDto } from "../dto/blogs.dto";
import { BlogModel } from "../schemas/blogs.schema";
import { Response, Request } from "express";
import { PostModel } from "../../posts/schemas/posts.schema";
import { CheckIfUserExist } from "../../../guards/auth.guard";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogBlogsCommand } from "../use-cases/blogs-create-blog-use-case";
import { CreatePostPostsCommand } from "../../posts/use-cases/posts-create-post-use-case";
import { DeletePostPostsCommand } from "../../posts/use-cases/posts-delete-post-use-case";
import { DeleteBlogBlogsCommand } from "../use-cases/blogs-delete-blog-use-case";
import { UpdateBlogBlogsCommand } from "../use-cases/blogs-update-blog-use-case";
import { UpdatePostPostsCommand } from "../../posts/use-cases/posts-update-post-use-case";
import { GetCommentsByBlogCommand } from '../../comments/use-cases/comments-get-comments-by-blog-use-case';
import { GetBlogsByOwnerBlogsCommand } from '../use-cases/blogs-get-blogs-by-owner-use-case';

@UseGuards(CheckIfUserExist)
@Controller('blogger/blogs/')
export class BloggersController {
  constructor(protected commandBus : CommandBus) {}
  @Get()
  async getBlogs(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm : string,
                 @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    return await this.commandBus.execute(new GetBlogsByOwnerBlogsCommand({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection,
      searchNameTerm : searchNameTerm
    }, token));
  }
  @HttpCode(200)
  @Get('comments')
  async getComments(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm : string,
                 @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    return await this.commandBus.execute(new GetCommentsByBlogCommand({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection
    }, token))
  }
  @Post()
  async createBlog(
    @Body() blog : BlogDto,
    @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    const createdBlog : BlogModel | null = await this.commandBus.execute(new CreateBlogBlogsCommand(blog, token))
    if (!createdBlog) throw new BadRequestException()
    return createdBlog
  }
  @Post(':id/posts')
  async createPost(@Param('id') blogId : string,
                   @Body() post : PostsBlogDto,
                   @Req() req: Request){
    if (!blogId.match(/^\d+$/)) throw new NotFoundException()
    const token = req.headers.authorization!.split(" ")[1]
    const createdPost : PostModel | null = await this.commandBus.execute(
      new CreatePostPostsCommand({
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: blogId
    }, token))
    if (!createdPost) throw new NotFoundException()
    return createdPost
  }

  @HttpCode(204)
  @Put(':id')
  async updateBlog(
    @Body() blog : BlogDto,
    @Param('id') blogId : string,
    @Req() req: Request){
    if (!blogId.match(/^\d+$/)) throw new NotFoundException()
    const token = req.headers.authorization!.split(" ")[1]
    return await this.commandBus.execute(new UpdateBlogBlogsCommand(blog, blogId, token))
  }

  @HttpCode(204)
  @Put(':blogId/posts/:postId')
  async updatePost(
    @Param('blogId') blogId : string,
    @Param('postId') postId : string,
    @Body() post : PostsBlogDto,
    @Req() req: Request){
    if (!blogId.match(/^\d+$/)) throw new NotFoundException()
    if (!postId.match(/^\d+$/)) throw new NotFoundException()
    const token = req.headers.authorization!.split(" ")[1]
    return await this.commandBus.execute(new UpdatePostPostsCommand({... post, blogId : blogId}, postId, token))
  }

  @HttpCode(204)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId : string,
                   @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    return await this.commandBus.execute(new DeleteBlogBlogsCommand(blogId, token))

  }
  @Delete(':blogId/posts/:postId')
  async deletePost(@Param('blogId') blogId : string,
                   @Param('postId') postId : string,
                   @Res() res : Response,
                   @Req() req: Request){
    if (!blogId.match(/^\d+$/)) throw new NotFoundException()
    if (!postId.match(/^\d+$/)) throw new NotFoundException()
    const token = req.headers.authorization!.split(" ")[1]
    const status : boolean = await this.commandBus.execute(
      new DeletePostPostsCommand(postId, blogId, token))
    if (!status) throw new NotFoundException()
    return res.sendStatus(204)
  }
}