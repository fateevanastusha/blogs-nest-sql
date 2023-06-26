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
    const blogForDelete : BlogModel[] = await this.blogsRepository.getFullBlog(command.blogId)
    if (blogForDelete.length === 0) throw new NotFoundException();
    if (blogForDelete[0].userId !== userId) throw new ForbiddenException()
    return await this.blogsRepository.deleteBlog(command.blogId)
  }
}