import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "../../../jwt.service";
import { PostsRepository } from "../../public/posts/posts.repository";
import { BlogsRepository } from "../../public/blogs/blogs.repository";
import { BlogModel } from "../../public/blogs/blogs.schema";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PostsDto } from "../../public/posts/posts.dto";

export class UpdatePostPostsCommand {
  constructor(public post : PostsDto,public postId : string,public token : string) {
  }
}

@CommandHandler(UpdatePostPostsCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostPostsCommand>{
  constructor(protected jwtService : JwtService,
              protected blogsRepository : BlogsRepository,
              protected postsRepository : PostsRepository) {}
  async execute (command : UpdatePostPostsCommand) : Promise<boolean>{
    const userId : string = await this.jwtService.getUserIdByToken(command.token)
    const blog : BlogModel[] = await this.blogsRepository.getFullBlog(command.post.blogId)
    if (blog.length ===0 ) throw new NotFoundException()
    if (blog[0].userId !== userId) throw new ForbiddenException()
    return await this.postsRepository.updatePost(command.post,command.postId)
  }
}