import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogModel} from "../../public/blogs/blogs.schema";
import { JwtService } from "../../../jwt.service";
import { BlogDto } from "../../public/blogs/blogs.dto";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { BlogsRepository } from "../../public/blogs/blogs.repository";


export class UpdateBlogBlogsCommand {
  constructor(public blog : BlogDto,public blogId: number,public token : string) {}
}
@CommandHandler(UpdateBlogBlogsCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogBlogsCommand>{
  constructor(private jwtService : JwtService,
              private blogsRepository : BlogsRepository) {}
  async execute (command : UpdateBlogBlogsCommand) : Promise<boolean>{
    const userId = await this.jwtService.getUserIdByToken(command.token);
    const blogForUpdate : BlogModel[] = await this.blogsRepository.getFullBlog(command.blogId);
    if (blogForUpdate.length === 0 ) throw new NotFoundException();
    if (blogForUpdate[0].userId !== userId) throw new ForbiddenException();
    return await this.blogsRepository.updateBlog(command.blog, command.blogId)
  }
}