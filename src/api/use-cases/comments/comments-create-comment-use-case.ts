import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "../../../jwt.service";
import { PostModel } from "../../public/posts/posts.schema";
import { PostsRepository } from "../../public/posts/posts.repository";
import { UserModel } from "../../superadmin/users/users.schema";
import { CommentViewModel, CreateCommentModel } from "../../public/comments/comments.schema";
import { CommentsRepository } from "../../public/comments/comments.repository";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { BlogModel } from "../../public/blogs/blogs.schema";
import { BlogsRepository } from "../../public/blogs/blogs.repository";
import { BannedUsersRepository } from "../../../banned-users/bloggers.banned.users.repository";

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

    const foundPost = await this.postsRepository.getPost(command.postId)//astring | null
    this.validateBlogAndPost(foundPost)


    const foundBlog : BlogModel[] = await this.blogsRepository.getFullBlog(foundPost[0].blogId)
    if (foundBlog.length === 0) throw new NotFoundException()

    const userId = await this.jwtService.getUserIdByToken(command.token)
    const status = await this.banRepository.findBan(userId, foundBlog[0].id)
    if(status) throw new ForbiddenException()

    const user = await this.usersRepository.getFullUser(userId)
    const comment : CreateCommentModel = {
      content : command.content,
      createdAt: new Date().toISOString(),
      postId : command.postId,
      userId : user[0].id,
      userLogin : user[0].login,
      blogId : foundBlog[0].id,
      blogName : foundBlog[0].name,
      blogOwnerId : foundBlog[0].userId,
      title : foundPost[0].title
    }
    const createdComment = await this.commentsRepository.createNewComment(comment);
    if (!createdComment) throw new UnauthorizedException()

    const mappedComment : CommentViewModel = {
      "id": createdComment.id + '',
      "content": createdComment.content,
      "commentatorInfo": {
        "userId": createdComment.userId + '',
        "userLogin": createdComment.userLogin
      },
      "createdAt": createdComment.createdAt,
      "likesInfo": {
        "likesCount": 0,
        "dislikesCount": 0,
        "myStatus": "None"
      }
    }
    return mappedComment
  }

  private validateBlogAndPost (foundPost:PostModel[] | []):asserts foundPost is PostModel[] {
  if (foundPost.length === 0 ) throw new NotFoundException()
}


}