import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../repository/blogs.repository";
import { JwtService } from '../../../utils/jwt.service';
import { BlogBanInfo } from '../schemas/blogs.schema';
import { BanBlogDto } from '../dto/blogs.dto';


export class BanBlogBlogsCommand {
  constructor(public blogId : string,public request : BanBlogDto) {}
}
@CommandHandler(BanBlogBlogsCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogBlogsCommand>{
  constructor(protected jwtService : JwtService,
              protected blogsRepository : BlogsRepository
  ) {}
  async execute (command : BanBlogBlogsCommand) : Promise<boolean>{
    await this.blogsRepository.getFullBlog(command.blogId)
    const banInfo : BlogBanInfo = {
      isBanned : command.request.isBanned,
      banDate : new Date().toISOString()
    }
    return await this.blogsRepository.banBlog(command.blogId, banInfo)
  }
}