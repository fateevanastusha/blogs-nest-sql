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
import { PostsDto } from "../../public/posts/posts.dto";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogBlogsCommand } from "../../use-cases/blogs/blogs-create-blog-use-case";

@Controller('blogger/blogs')
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
  @Put(':id/posts')
  async updatePost(
    @Body() post : PostsDto,
    @Param('id') postId : string,
    @Res() res : Response){
    const status : boolean = await this.postsService.updatePost(post, postId)
    if (!status) throw new NotFoundException()
    return
  }
  @HttpCode(204)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId : string,
                   @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    await this.bloggersService.deleteBlog(blogId, token)
    return
  }
  @Delete(':id/posts')
  async deletePost(@Param('id') postId : string,
                   @Res() res : Response){
    const status : boolean = await this.postsService.deletePost(postId)
    if (!status) throw new NotFoundException()
    return res.sendStatus(204)
  }
}