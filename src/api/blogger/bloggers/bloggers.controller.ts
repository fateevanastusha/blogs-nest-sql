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
import { BloggersService } from "./bloggers.service";
import { BlogDto, PostsBlogDto } from "../../public/blogs/blogs.dto";
import { PostsService } from "../../public/posts/posts.service";
import { BlogModel } from "../../public/blogs/blogs.schema";
import { Response, Request } from "express";
import { PostModel } from "../../public/posts/posts.schema";
import { AuthGuard, CheckIfUserExist } from "../../../auth.guard";
import { PostsDto } from "../../public/posts/posts.dto";

@Controller('blogger/blogs')
export class BloggersController {
  constructor(protected bloggersService : BloggersService,
              protected postsService : PostsService
  ) {}
  @Get()
  async getBlogs(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm : string){
    return await this.bloggersService.getBlogs({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection,
      searchNameTerm : searchNameTerm
    })
  }
  @UseGuards(CheckIfUserExist)
  @Post()
  async createBlog(
    @Body() blog : BlogDto,
    @Req() req: Request){
    const token = req.headers.authorization!.split(" ")[1]
    const createdBlog : BlogModel | null = await this.bloggersService.createBlog(blog, token)
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
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateBlog(
    @Body() blog : BlogDto,
    @Param('id') blogId : string,
    @Res() res : Response){
    const status : boolean = await this.bloggersService.updateBlog(blog, blogId)
    if(!status) throw new NotFoundException()
    res.sendStatus(204)
    return
  }
  @Put(':id/posts')
  async updatePost(
    @Body() post : PostsDto,
    @Param('id') postId : string,
    @Res() res : Response){
    const status : boolean = await this.postsService.updatePost(post, postId)
    if (!status) throw new NotFoundException()
    res.sendStatus(204)
    return
  }
  @Delete(':id')
  async deleteBlog(@Param('id') blogId : string,
                   @Res() res : Response){
    const status : boolean = await this.bloggersService.deleteBlog(blogId)
    if (!status) throw new NotFoundException()
    res.sendStatus(204)
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