import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogModel } from "../../public/blogs/blogs.schema";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { JwtService } from "../../../jwt.service";
import { BloggersRepository } from "../../blogger/bloggers/bloggers.repository";


export class DeleteBlogBlogsCommand {
  constructor(public blogId: string, public token : string) {
  }
}

@CommandHandler(DeleteBlogBlogsCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogBlogsCommand>{
  constructor(protected jwtService : JwtService, protected blogsRepository : BloggersRepository) {}
  async execute (command : DeleteBlogBlogsCommand) : Promise<boolean>{
    const userId = await this.jwtService.getUserIdByToken(command.token)
    const blogForUpdate : BlogModel | null = await this.blogsRepository.getFullBlog(command.blogId)
    if (!blogForUpdate) throw new NotFoundException();
    if (blogForUpdate.userId !== userId) throw new ForbiddenException()
    return await this.blogsRepository.deleteBlog(command.blogId)
  }
}