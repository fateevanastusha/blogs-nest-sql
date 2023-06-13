import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "../../../jwt.service";
import { PostModel } from "../../public/posts/posts.schema";
import { PostsRepository } from "../../public/posts/posts.repository";
import { UserModel } from "../../superadmin/users/users.schema";
import { CommentModel } from "../../public/comments/comments.schema";
import { CommentsRepository } from "../../public/comments/comments.repository";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { BlogModel } from "../../public/blogs/blogs.schema";
import { BlogsRepository } from "../../public/blogs/blogs.repository";

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
              protected blogsRepository : BlogsRepository) {}
  async execute (command : CreateCommentCommentsCommand) : Promise<CommentModel | null>{
    const foundPost : PostModel | null = await this.postsRepository.getPost(command.postId)
    if (foundPost === null) throw new NotFoundException()
    const foundBlog : BlogModel | null = await this.blogsRepository.getFullBlog(foundPost.blogId)
    if (foundBlog === null) throw new NotFoundException()
    let userId = await this.jwtService.getUserIdByToken(command.token)
    if(foundBlog.bannedUsers.find(a => a.userId === userId)) throw new UnauthorizedException()
    const user : UserModel | null = await this.usersRepository.getFullUser(userId)
    const comment : CommentModel = {
      id : (+new Date()).toString(),
      content : command.content,
      commentatorInfo : {
        userId: userId,
        userLogin: user!.login
      },
      createdAt: new Date().toISOString(),
      postId : command.postId,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None"
      },
      postInfo : {
        id : command.postId,
        title : foundPost.title,
        blogId : foundPost.blogId,
        blogName : foundPost.blogName,
        blogOwnerId : foundBlog.blogOwnerInfo.userId
      }
    }
    const createdComment = await this.commentsRepository.createNewComment(comment);
    if (!createdComment) throw new UnauthorizedException()
    return createdComment
  }
}