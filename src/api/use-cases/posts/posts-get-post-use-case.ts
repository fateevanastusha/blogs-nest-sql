import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "../../../jwt.service";
import { PostsRepository } from "../../public/posts/posts.repository";
import { BlogsRepository } from "../../public/blogs/blogs.repository";
import { PostModel, PostViewModel } from "../../public/posts/posts.schema";
import { NotFoundException } from "@nestjs/common";
import { LikesInfo } from "../../public/comments/comments.schema";
import { LikeViewModel } from "../../../likes/likes.schema";
import { LikesRepository } from "../../../likes/likes.repository";

export class GetPostPostsCommand {
  constructor(public postId: string, public header : string) {
  }
}

@CommandHandler(GetPostPostsCommand)
export class GetPostUseCase implements ICommandHandler<GetPostPostsCommand>{
  constructor(protected jwtService : JwtService,
              protected blogsRepository : BlogsRepository,
              protected postsRepository : PostsRepository,
              protected likesRepository : LikesRepository) {}
  async execute (command : GetPostPostsCommand) : Promise<PostViewModel>{
    const findPost : PostModel[] =  await this.postsRepository.getPost(command.postId);
    if (findPost.length === 0) throw new NotFoundException();
    const post = findPost[0];
    const blog = await this.blogsRepository.getFullBlog(post.blogId);
    if(blog[0].isBanned) throw new NotFoundException();
    let likesInfo : LikesInfo;
    if(command.header){
      const token = command.header.split(" ")[1];
      const userId : string = await this.jwtService.getUserIdByToken(token);
      likesInfo = (await this.likesRepository.getLikesInfoWithUser(userId, command.postId))[0];
    }
    else {
      likesInfo = (await this.likesRepository.getLikesInfo(command.postId))[0];
    };
    const newestLikes : LikeViewModel[] = await this.likesRepository.getLastLikes(command.postId);
    const mappedNewestLikes : LikeViewModel[] = newestLikes.map(a => {
      return {
        addedAt : a.addedAt,
        login : a.login,
        userId : a.userId + ''
      }
    })
    const mappedPost : PostViewModel = {
      id : post.id + '',
      title : post.title,
      shortDescription : post.shortDescription,
      content : post.content,
      blogId : post.blogId + '',
      blogName : post.blogName,
      createdAt : post.createdAt,
      extendedLikesInfo : {
        likesCount : likesInfo.likesCount,
        dislikesCount : likesInfo.dislikesCount,
        myStatus : likesInfo.myStatus,
        newestLikes : mappedNewestLikes
      }
    };
    return mappedPost;
  }
}