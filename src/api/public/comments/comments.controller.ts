import { Body, Controller, Delete, Get, HttpCode, Param, Put, Req, UseGuards } from "@nestjs/common";
import { CommentsDto } from "./comments dto";
import { CheckIfUserExist, CommentCheckForSameUser } from "../../../auth.guard";
import { CommentViewModel } from "./comments.schema";
import { JwtService } from "../../../jwt.service";
import { LikesDto } from "../../../likes/likes.dto";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateCommentCommentsCommand } from "../../use-cases/comments/comments-update-comment-use-case";
import { GetCommentCommentsCommand } from "../../use-cases/comments/comments-get-comment-use-case";
import { GetCommentWithUserCommentsCommand } from "../../use-cases/comments/comments-get-comment-with-user-use-case";
import { DeleteCommentCommentsCommand } from "../../use-cases/comments/comments-delete-comment-use-case";
import { LikeCommentCommentsCommand } from "../../use-cases/comments/comments-like-comment-use-case";

@Controller('comments')
export class CommentsController {
  constructor(protected jwtService : JwtService,
              protected commandBus : CommandBus) {}
  @HttpCode(200)
  @Get(':id')
  async getComment(@Param('id') commentId : number,
                   @Req() req: any){
    const token = req.headers.authorization;
    if (!token){
      const comment : CommentViewModel = await this.commandBus.execute(new GetCommentCommentsCommand(commentId));
      return comment;
    } else {
      const token = req.headers.authorization!.split(" ")[1];
      let userId : number = await this.jwtService.getUserIdByToken(token);
      const comment : CommentViewModel = await this.commandBus.execute(new GetCommentWithUserCommentsCommand(userId, commentId));
      return comment;
    }
  }
  @HttpCode(204)
  @UseGuards(CommentCheckForSameUser)
  @Delete(':id')
  async deleteComment(@Param('id') commentId : number){
    return await this.commandBus.execute(new DeleteCommentCommentsCommand(commentId))
  }
  @HttpCode(204)
  @UseGuards(CommentCheckForSameUser)
  @Put(':id')
  async updateComment(@Param('id') commentId : number,
                      @Body() comment : CommentsDto){
    return await this.commandBus.execute(new UpdateCommentCommentsCommand(comment.content, commentId))
  }

  @HttpCode(204)
  @UseGuards(CheckIfUserExist)
  @Put(':id/like-status')
  async changeLikeStatus(@Param('id') commentId : number,
                         @Body() requestType : LikesDto,
                         @Req() req: any){
    const token = req.headers.authorization!.split(" ")[1]
    const userId : number = await this.jwtService.getUserIdByToken(token);
    return await this.commandBus.execute(new LikeCommentCommentsCommand(requestType.likeStatus, commentId, userId))
  }
}