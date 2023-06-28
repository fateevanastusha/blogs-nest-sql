import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get, HttpCode,
  Post,
  Res,
  UseGuards
} from "@nestjs/common";
import { BloggersRepository } from "./api/blogger/bloggers/bloggers.repository";
import { PostsRepository } from "./api/public/posts/posts.repository";
import { UsersRepository } from "./api/superadmin/users/users.repository";
import { Response} from "express";
import { SecurityRepository } from "./api/public/security/security.repository";
import { LikesRepository } from "./likes/likes.repository";
import { CommentsRepository } from "./api/public/comments/comments.repository";
import { AuthGuard, CheckIfUserExist } from "./auth.guard";
import { BlogDto } from "./api/public/blogs/blogs.dto";
import { BlogModel, CreateBlogModel } from "./api/public/blogs/blogs.schema";
import { BloggersService } from "./api/blogger/bloggers/bloggers.service";
import { TestRepo } from "./test.repo";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BannedUsersRepository } from "./api/blogger/bloggers/bloggers.bannedUsers.repository";

@Controller()
export class AppController {
  constructor(protected blogsRepository : BloggersRepository,
              protected postsRepository : PostsRepository,
              protected usersRepository : UsersRepository,
              protected securityRepository : SecurityRepository,
              protected likesRepository : LikesRepository,
              protected commentsRepository : CommentsRepository,
              protected appRepository : TestRepo,
              protected banRepository : BannedUsersRepository,
              @InjectDataSource() protected dataSource : DataSource
              ) {}

  @Delete('/testing/all-data')
  async deleteAllData(@Res() res : Response) {
    await this.banRepository.deleteAllData();
    await this.securityRepository.deleteAllData();
    await this.likesRepository.deleteAllData();
    await this.commentsRepository.deleteAllData();
    await this.postsRepository.deleteAllData();
    await this.blogsRepository.deleteAllData();
    await this.usersRepository.deleteAllData();
    res.sendStatus(204)
    return;
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
    const createdBlog : BlogModel | null = await this.blogsRepository.createBlog(newBlog)
    if(!createdBlog) throw new BadRequestException()
    return createdBlog
  }
  @HttpCode(200)
  @Get('/test-sql')
  async testForSql(){
    return await this.appRepository.sqlTest()
  }
}
