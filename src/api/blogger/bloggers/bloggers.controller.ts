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
import { BloggersService } from "./bloggers.service";
import { BlogDto, PostsBlogDto } from "../../public/blogs/blogs.dto";
import { PostsService } from "../../public/posts/posts.service";
import { BlogModel } from "../../public/blogs/blogs.schema";
import { Response, Request } from "express";
import { PostModel } from "../../public/posts/posts.schema";
import { CheckIfUserExist } from "../../../auth.guard";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogBlogsCommand } from "../../use-cases/blogs/blogs-create-blog-use-case";
import { CreatePostPostsCommand } from "../../use-cases/posts/posts-create-post-use-case";
import { DeletePostPostsCommand } from "../../use-cases/posts/posts-delete-post-use-case";
import { DeleteBlogBlogsCommand } from "../../use-cases/blogs/blogs-delete-blog-use-case";

@Controller('blogger/blogs/')
export class BloggersController {
  constructor(protected bloggersService : BloggersService,
              protected postsService : PostsService,
              protected commandBus : CommandBus) {}
  @UseGuards(CheckIfUserExist)
  @Get()
  async getBlogs(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm : string,
                 @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    return await this.bloggersService.getBlogs({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection,
      searchNameTerm : searchNameTerm
    }, token)
  }
  @HttpCode(200)
  @UseGuards(CheckIfUserExist)
  @Get('comments')
  async getComments(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm : string,
                 @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    return await this.bloggersService.getComments({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection
    }, token)
  }
  @UseGuards(CheckIfUserExist)
  @Post()
  async createBlog(
    @Body() blog : BlogDto,
    @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    const createdBlog : BlogModel | null = await this.commandBus.execute(
      new CreateBlogBlogsCommand(blog, token)
    )
    if (!createdBlog) throw new BadRequestException()
    return createdBlog
  }
  @UseGuards(CheckIfUserExist)
  @Post(':id/posts')
  async createPost(@Param('id') blogId : string,
                   @Body() post : PostsBlogDto,
                   @Req() req: Request){
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
  @UseGuards(CheckIfUserExist)
  @Put(':id')
  async updateBlog(
    @Body() blog : BlogDto,
    @Param('id') blogId : string,
    @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    const status : boolean = await this.bloggersService.updateBlog(blog, blogId, token);
    if(!status) throw new NotFoundException();
    return;
  }
  @HttpCode(204)
  @UseGuards(CheckIfUserExist)
  @Put(':blogId/posts/:postId')
  async updatePost(
    @Param('blogId') blogId : string,
    @Param('postId') postId : string,
    @Body() post : PostsBlogDto,
    @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    const status : boolean = await this.postsService.updatePost({
        title : post.title,
        content : post.content,
        shortDescription : post.shortDescription,
        blogId : blogId }, postId, token)
    if (!status) throw new NotFoundException()
    return
  }
  @HttpCode(204)
  @UseGuards(CheckIfUserExist)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId : string,
                   @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    await this.commandBus.execute(new DeleteBlogBlogsCommand(blogId, token))
    return
  }
  @UseGuards(CheckIfUserExist)
  @Delete(':blogId/posts/:postId')
  async deletePost(@Param('blogId') blogId : string,
                   @Param('postId') postId : string,
                   @Res() res : Response,
                   @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    const status : boolean = await this.commandBus.execute(
      new DeletePostPostsCommand(postId, blogId, token))
    if (!status) throw new NotFoundException()
    return res.sendStatus(204)
  }
}