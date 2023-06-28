import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, Req, UseGuards } from "@nestjs/common";
import { CommentsDto } from "./comments dto";
import { CheckIfUserExist, CommentCheckForSameUser } from "../../../auth.guard";
import { CommentsService } from "./comments.service";
import { CommentViewModel } from "./comments.schema";
import { JwtService } from "../../../jwt.service";
import { LikesDto } from "../../../likes/likes.dto";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateCommentCommentsCommand } from "../../use-cases/comments/comments-update-comment-use-case";

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService : CommentsService,
              protected jwtService : JwtService,
              protected commandBus : CommandBus) {}
  @HttpCode(200)
  @Get(':id')
  async getComment(@Param('id') commentId : number,
                   @Req() req: any){
    const token = req.headers.authorization
    if (!token){
      const comment : CommentViewModel = await this.commentsService.getCommentById(req.params.id)
      if (!comment) {
        throw new NotFoundException()
      } else {
        return comment
      }
    } else {
      const token = req.headers.authorization!.split(" ")[1]
      let userId : number = await this.jwtService.getUserIdByToken(token);
      const comment = await this.commentsService.getCommentByIdWithUser(req.params.id, userId);
      if (!comment) {
        throw new NotFoundException()
      } else {
        return comment
      }
    }
  }
  @HttpCode(204)
  @UseGuards(CommentCheckForSameUser)
  @Delete(':id')
  async deleteComment(@Param('id') commentId : number){
    const status = await this.commentsService.deleteCommentById(commentId);
    if (!status) throw new NotFoundException();
    return;
  }
  @HttpCode(204)
  @UseGuards(CommentCheckForSameUser)
  @Put(':id')
  async updateComment(@Param('id') commentId : number,
                      @Body() comment : CommentsDto){
    const status : boolean = await this.commandBus.execute(new UpdateCommentCommentsCommand(comment.content, commentId))
    if (!status) throw new NotFoundException();
    return;
  }

  @HttpCode(204)
  @UseGuards(CheckIfUserExist)
  @Put(':id/like-status')
  async changeLikeStatus(@Param('id') commentId : number,
                         @Body() requestType : LikesDto,
                         @Req() req: any){
    const token = req.headers.authorization!.split(" ")[1]
    const userId : number = await this.jwtService.getUserIdByToken(token);
    const status : boolean = await this.commentsService.changeLikeStatus(requestType.likeStatus, commentId, userId)
    if (!status) throw new NotFoundException();
    return;
  }
}