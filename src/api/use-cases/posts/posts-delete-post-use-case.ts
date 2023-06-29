import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogModel } from "../../public/blogs/blogs.schema";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PostModel } from "../../public/posts/posts.schema";
import { JwtService } from "../../../jwt.service";
import { PostsRepository } from "../../public/posts/posts.repository";
import { BlogsRepository } from "../../public/blogs/blogs.repository";

export class DeletePostPostsCommand {
  constructor(public postId : number,public blogId: number,public token : string) {
  }
}

@CommandHandler(DeletePostPostsCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostPostsCommand>{
  constructor(protected jwtService : JwtService,
              protected blogsRepository : BlogsRepository,
              protected postsRepository : PostsRepository) {}
  async execute (command : DeletePostPostsCommand) : Promise<boolean>{
    const userId : number = await this.jwtService.getUserIdByToken(command.token)
    const blog : BlogModel[] = await this.blogsRepository.getFullBlog(+command.blogId)
    if (blog.length === 0) throw new NotFoundException()

    const post : PostModel[] = await this.postsRepository.getPost(command.postId)
    if (post.length === 0) throw new NotFoundException()

    if(post[0].blogId !== +command.blogId) throw new NotFoundException()
    if (blog[0].userId !== userId) throw new ForbiddenException()

    return await this.postsRepository.deletePost(command.postId)
  }
}