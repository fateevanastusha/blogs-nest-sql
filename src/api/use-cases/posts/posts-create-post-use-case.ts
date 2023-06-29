import { PostsDto } from "../../public/posts/posts.dto";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePostModel, PostModel } from "../../public/posts/posts.schema";
import { BlogModel } from "../../public/blogs/blogs.schema";
import { UserModel } from "../../superadmin/users/users.schema";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PostsRepository } from "../../public/posts/posts.repository";
import { JwtService } from "../../../jwt.service";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { BlogsRepository } from "../../public/blogs/blogs.repository";

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
    const blog : BlogModel[] = await this.blogsRepository.getFullBlog(command.post.blogId)
    if (blog.length === 0) throw new NotFoundException()

    const userId : number = await this.jwtService.getUserIdByToken(command.token)
    const user : UserModel[] | null = await this.usersRepository.getFullUser(userId)
    if (user[0].id !== blog[0].userId) throw new ForbiddenException()

    const newPost : CreatePostModel = {
      title : command.post.title,
      shortDescription: command.post.shortDescription,
      content: command.post.content,
      blogId: command.post.blogId,
      blogName: blog[0].name,
      createdAt : new Date().toISOString()
    };
    const createdPost = await this.postsRepository.createPost(newPost);
    if (!createdPost) throw new BadRequestException();
    const mappedPost = {
      "id": createdPost.id,
      "title": createdPost.title,
      "shortDescription": createdPost.shortDescription,
      "content": createdPost.content,
      "blogId": createdPost.blogId,
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