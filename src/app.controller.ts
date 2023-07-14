import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Res,
} from '@nestjs/common';
import { UsersRepository } from "./modules/users/repository/users.repository";
import { Response} from "express"
import { BlogDto } from "./modules/blogs/dto/blogs.dto";
import { BlogViewModel, CreateBlogModel } from "./modules/blogs/schemas/blogs.schema";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogsRepository } from "./modules/blogs/repository/blogs.repository";

@Controller()
export class AppController{
  constructor(protected blogsRepository : BlogsRepository,
              protected usersRepository : UsersRepository,
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
  @Get('/')
  async app(){
    return('Welcome to APP')
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
}
