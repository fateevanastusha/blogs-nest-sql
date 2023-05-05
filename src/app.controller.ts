import { Controller, Delete, Res } from "@nestjs/common";
import { BlogsRepository } from "./blogs/blogs.repository";
import { PostsRepository } from "./posts/posts.repository";
import { UsersRepository } from "./users/users.repository";
import { Response} from "express";

@Controller()
export class AppController {
  constructor(protected blogsRepository : BlogsRepository, protected postsRepository : PostsRepository, protected usersRepository : UsersRepository) {}

  @Delete('/testing/all-data')
  async deleteAllData(@Res() res : Response) {
    await this.blogsRepository.deleteAllData();
    await this.postsRepository.deleteAllData();
    await this.usersRepository.deleteAllData();
    res.sendStatus(204)
    return;
  }
}
