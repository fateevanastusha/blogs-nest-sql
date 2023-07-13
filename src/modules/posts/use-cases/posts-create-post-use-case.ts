import { PostsDto } from "../dto/posts.dto";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePostModel, PostModel } from "../schemas/posts.schema";
import { UserModel } from "../../users/schemas/users.schema";
import { ForbiddenException } from "@nestjs/common";
import { PostsRepository } from "../repository/posts.repository";
import { JwtService } from "../../../utils/jwt.service";
import { UsersRepository } from "../../users/repository/users.repository";
import { BlogsRepository } from "../../blogs/repository/blogs.repository";

export class CreatePostPostsCommand {
  constructor(public post: PostsDto, public token : string) {
  }
}

@CommandHandler(CreatePostPostsCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostPostsCommand>{
  constructor(private postsRepository : PostsRepository,
              protected blogsRepository : BlogsRepository,
              protected jwtService : JwtService,
              protected usersRepository : UsersRepository) {}
  async execute (command : CreatePostPostsCommand) : Promise<PostModel>{
    const blog = await this.blogsRepository.getFullBlog(command.post.blogId)
    const userId : string = await this.jwtService.getUserIdByToken(command.token)
    const user : UserModel[] = await this.usersRepository.getFullUser(userId)
    if (user[0].id !== blog.userId) throw new ForbiddenException()

    const newPost : CreatePostModel = {
      title : command.post.title,
      shortDescription: command.post.shortDescription,
      content: command.post.content,
      blogId: command.post.blogId,
      blogName: blog.name,
      createdAt : new Date().toISOString()
    };
    const createdPost = await this.postsRepository.createPost(newPost);
    const mappedPost = {
      "id": createdPost.id + '',
      "title": createdPost.title,
      "shortDescription": createdPost.shortDescription,
      "content": createdPost.content,
      "blogId": createdPost.blogId + '',
      "blogName": createdPost.blogName,
      "createdAt": createdPost.createdAt,
      "extendedLikesInfo": {
        "likesCount": 0,
        "dislikesCount": 0,
        "myStatus": "None",
        "newestLikes": []
      }
    }
    return mappedPost;
  }
}