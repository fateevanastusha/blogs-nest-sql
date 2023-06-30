import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get, HttpCode, OnModuleInit,
  Post,
  Res,
} from '@nestjs/common';
import { PostsRepository } from "./api/public/posts/posts.repository";
import { UsersRepository } from "./api/superadmin/users/users.repository";
import { Response} from "express";
import { SecurityRepository } from "./api/public/security/security.repository";
import { LikesRepository } from "./likes/likes.repository";
import { CommentsRepository } from "./api/public/comments/comments.repository";
import { BlogDto } from "./api/public/blogs/blogs.dto";
import { BlogModel, BlogViewModel, CreateBlogModel } from "./api/public/blogs/blogs.schema";
import { TestRepo } from "./test.repo";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogsRepository } from "./api/public/blogs/blogs.repository";

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
      userId: 1,
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
