import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogModel, BlogViewModel, CreateBlogModel } from "../../public/blogs/blogs.schema";
import { JwtService } from "../../../jwt.service";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { BlogDto } from "../../public/blogs/blogs.dto";
import { BlogsRepository } from "../../public/blogs/blogs.repository";

export class CreateBlogBlogsCommand {
  constructor(public blog: BlogDto, public token : string)
  {}}

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
    return result[0];
  }
}