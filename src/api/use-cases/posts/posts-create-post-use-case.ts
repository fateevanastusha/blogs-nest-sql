import { PostsDto } from "../../public/posts/posts.dto";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostModel } from "../../public/posts/posts.schema";
import { BlogModel } from "../../public/blogs/blogs.schema";
import { UserModel } from "../../superadmin/users/users.schema";
import { ForbiddenException } from "@nestjs/common";
import { PostsRepository } from "../../public/posts/posts.repository";
import { JwtService } from "../../../jwt.service";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { BloggersRepository } from "../../blogger/bloggers/bloggers.repository";

export class CreatePostPostsCommand {
  constructor(public post: PostsDto, public token : string) {
  }
}

@CommandHandler(CreatePostPostsCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostPostsCommand>{
  constructor(private postsRepository : PostsRepository,
              protected blogsRepository : BloggersRepository,
              protected jwtService : JwtService,
              protected usersRepository : UsersRepository) {}
  async execute (command : CreatePostPostsCommand) : Promise<PostModel | null>{
    const blog : BlogModel | null = await this.blogsRepository.getFullBlog(command.post.blogId)
    if (!blog) return null
    const userId : string = await this.jwtService.getUserIdByToken(command.token)
    const user : UserModel | null = await this.usersRepository.getFullUser(userId)
    if (user.id !== blog.userId) throw new ForbiddenException()
    const newPost : PostModel = {
      id: '' + (+(new Date())),
      title : command.post.title,
      shortDescription: command.post.shortDescription,
      content: command.post.content,
      blogId: command.post.blogId,
      blogName: blog.name,
      createdAt : new Date().toISOString()
    };
    const createdPost = await this.postsRepository.createPost(newPost);
    if (!createdPost) return null
    return createdPost;
  }
}