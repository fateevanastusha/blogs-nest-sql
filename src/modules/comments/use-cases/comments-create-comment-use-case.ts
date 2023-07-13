import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "../../../utils/jwt.service";
import { PostModel } from "../../posts/schemas/posts.schema";
import { PostsRepository } from "../../posts/repository/posts.repository";
import { UserModel } from "../../users/schemas/users.schema";
import { CommentViewModel, CreateCommentModel } from "../schemas/comments.schema";
import { CommentsRepository } from "../repository/comments.repository";
import { UsersRepository } from "../../users/repository/users.repository";
import { BlogModel } from "../../blogs/schemas/blogs.schema";
import { BlogsRepository } from "../../blogs/repository/blogs.repository";
import { BannedUsersRepository } from "../../users/repository/bloggers.banned.users.repository";

export class CreateCommentCommentsCommand {
  constructor(public postId : string,public content : string,public token : string) {
  }
}

@CommandHandler(CreateCommentCommentsCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommentsCommand>{
  constructor(protected jwtService : JwtService,
              protected postsRepository : PostsRepository,
              protected commentsRepository : CommentsRepository,
              protected usersRepository : UsersRepository,
              protected blogsRepository : BlogsRepository,
              protected banRepository : BannedUsersRepository) {}
  async execute (command : CreateCommentCommentsCommand) : Promise<CommentViewModel | null>{

    const foundPost = await this.postsRepository.getPost(command.postId)
    const foundBlog = await this.blogsRepository.getFullBlog(foundPost.blogId)
    const userId = await this.jwtService.getUserIdByToken(command.token)
    const status = await this.banRepository.findBan(userId, foundBlog.id)
    if(status) throw new ForbiddenException()

    const user = await this.usersRepository.getFullUser(userId)
    const comment : CreateCommentModel = {
      content : command.content,
      createdAt: new Date().toISOString(),
      postId : command.postId,
      userId : user[0].id,
      userLogin : user[0].login,
      blogId : foundBlog.id,
      blogName : foundBlog.name,
      blogOwnerId : foundBlog.userId,
      title : foundPost.title
    }
    const createdComment = await this.commentsRepository.createNewComment(comment);
    if (!createdComment) throw new UnauthorizedException()

    const mappedComment : CommentViewModel = {
      id: createdComment.id + '',
      content: createdComment.content,
      commentatorInfo: {
        userId: createdComment.userId + '',
        userLogin: createdComment.userLogin
      },
      createdAt: createdComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None"
      }
    }
    return mappedComment
  }

}