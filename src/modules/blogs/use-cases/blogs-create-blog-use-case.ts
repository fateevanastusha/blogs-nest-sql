import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogViewModel, CreateBlogModel } from "../schemas/blogs.schema";
import { JwtService } from "../../../utils/jwt.service";
import { UsersRepository } from "../../users/repository/users.repository";
import { BlogDto } from "../dto/blogs.dto";
import { BlogsRepository } from "../repository/blogs.repository";

export class CreateBlogBlogsCommand {
  constructor(public blog: BlogDto, public token : string) {}}

@CommandHandler(CreateBlogBlogsCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogBlogsCommand>{
  constructor(private jwtService : JwtService, private usersRepository : UsersRepository, private blogsRepository : BlogsRepository) {}
  async execute (command : CreateBlogBlogsCommand) : Promise<BlogViewModel>{
    const {blog, token} = command
    const userId = await this.jwtService.getUserIdByToken(token)
    const user = await this.usersRepository.getFullUser(userId)
    const newBlog : CreateBlogModel = {
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date().toISOString(),
      userId: userId,
      userLogin: user[0].login
    }
    const result = await this.blogsRepository.createBlog(newBlog)
    result[0].id = result[0].id + ''
    return result[0];
  }
}