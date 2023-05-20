import { Controller, Delete, Get, Res } from "@nestjs/common";
import { BlogsRepository } from "./blogs/blogs.repository";
import { PostsRepository } from "./posts/posts.repository";
import { UsersRepository } from "./users/users.repository";
import { Response} from "express";
import { SecurityRepository } from "./security/security.repository";
import { LikesRepository } from "./likes/likes.repository";
import { CommentsRepository } from "./comments/comments.repository";

@Controller()
export class AppController {
  constructor(protected blogsRepository : BlogsRepository,
              protected postsRepository : PostsRepository,
              protected usersRepository : UsersRepository,
              protected securityRepository : SecurityRepository,
              protected likesRepository : LikesRepository,
              protected commentsRepository : CommentsRepository,
              ) {}

  @Delete('/testing/all-data')
  async deleteAllData(@Res() res : Response) {
    await this.blogsRepository.deleteAllData();
    await this.postsRepository.deleteAllData();
    await this.usersRepository.deleteAllData();
    await this.securityRepository.deleteAllData();
    await this.likesRepository.deleteAllData();
    await this.commentsRepository.deleteAllData();
    res.sendStatus(204)
    return;
  }

  @Get('/likes')
  async getAllLikes(){
    return await this.likesRepository.getAllLikes()
  }
  @Get('/all-comments')
  async getAllComments(){
    return await this.commentsRepository.getAllComments()
  }
  @Get('/get-all-sessions')
  async getAllSessions(){
    return await this.securityRepository.getAll()
  }
}
