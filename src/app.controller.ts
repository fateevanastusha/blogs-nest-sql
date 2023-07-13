import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get, HttpCode,
  Post,
  Res,
} from '@nestjs/common';
import { PostsRepository } from "./modules/posts/repository/posts.repository";
import { UsersRepository } from "./modules/users/repository/users.repository";
import { Response} from "express";
import { SecurityRepository } from "./modules/security/repository/security.repository";
import { LikesRepository } from "./modules/likes/repository/likes.repository";
import { CommentsRepository } from "./modules/comments/repository/comments.repository";
import { BlogDto } from "./modules/blogs/dto/blogs.dto";
import { BlogModel, BlogViewModel, CreateBlogModel } from "./modules/blogs/schemas/blogs.schema";
import { TestRepo } from "./test.repo";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogsRepository } from "./modules/blogs/repository/blogs.repository";

@Controller()
export class AppController{
  constructor(protected blogsRepository : BlogsRepository,
              protected postsRepository : PostsRepository,
              protected usersRepository : UsersRepository,
              protected securityRepository : SecurityRepository,
              protected likesRepository : LikesRepository,
              protected commentsRepository : CommentsRepository,
              protected appRepository : TestRepo,
              @InjectDataSource() protected dataSource : DataSource
              ) {}

  @Delete('/testing/all-data')
  async deleteAllData(@Res() res : Response) {
    await this.dataSource.query(`
      DELETE FROM public."BannedForBlogUser";
      DELETE FROM public."RefreshTokens";
      DELETE FROM public."Likes";
      DELETE FROM public."Comments";
      DELETE FROM public."Posts";
      DELETE FROM public."Blogs";
      DELETE FROM public."Users";
    `)
    res.sendStatus(204)
  }
  @Get('/likes')
  async getAllLikes(){
    return await this.likesRepository.getAllLikes()
  }
  @Post('/blog')
  async createBlog(@Body() blog : BlogDto){
    const newBlog : CreateBlogModel = {
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date().toISOString(),
      userId: '1',
      userLogin: 'userLogin'
    }
    const createdBlog : BlogViewModel[] = await this.blogsRepository.createBlog(newBlog)
    if(createdBlog.length === 0) throw new BadRequestException()
    return createdBlog[0]
  }
  @HttpCode(200)
  @Get('/test-sql')
  async testForSql(){
    return await this.appRepository.sqlTest()
  }
}
