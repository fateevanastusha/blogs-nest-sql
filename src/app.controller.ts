import { Controller, Delete } from "@nestjs/common";
import { BlogsRepository } from "./blogs/blogs.repository";
import { PostsRepository } from "./posts/posts.repository";
import { UsersRepository } from "./users/users.repository";

@Controller()
export class AppController {
  constructor(protected blogsRepository : BlogsRepository, protected postsRepository : PostsRepository, protected usersRepository : UsersRepository) {}

  @Delete('/testing/all-data')
  async deleteAllData() {
    await this.blogsRepository.deleteAllData();
    await this.postsRepository.deleteAllData();
    await this.usersRepository.deleteAllData();
    return;
  }
}
