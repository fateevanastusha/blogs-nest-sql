import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogModel } from "../schemas/blogs.schema";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { JwtService } from "../../../utils/jwt.service";
import { BlogsRepository } from "../repository/blogs.repository";


export class DeleteBlogBlogsCommand {
  constructor(public blogId: string, public token : string) {
  }
}

@CommandHandler(DeleteBlogBlogsCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogBlogsCommand>{
  constructor(protected jwtService : JwtService, protected blogsRepository : BlogsRepository) {}
  async execute (command : DeleteBlogBlogsCommand) : Promise<boolean>{
    if (!command.blogId.match(/^\d+$/)) throw new NotFoundException()
    const userId = await this.jwtService.getUserIdByToken(command.token)
    const blogForDelete = await this.blogsRepository.getFullBlog(command.blogId)
    if (blogForDelete.userId !== userId) throw new ForbiddenException()
    return await this.blogsRepository.deleteBlog(command.blogId)
  }
}