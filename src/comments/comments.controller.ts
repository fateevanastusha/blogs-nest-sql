import { Body, Controller, Delete, Get, HttpCode, Param, Put, Req, UseGuards } from "@nestjs/common";
import { CommentsDto } from "./comments dto";
import { CheckForExistingUser, CheckCommentForUser, CheckForSameUser } from "../auth.guard";
import { CommentsService } from "./comments.service";
import { CommentModel } from "./comments.schema";
import { ErrorCodes, errorHandler } from "../helpers/errors";
import { JwtService } from "../jwt.service";
import { LikesDto } from "../likes/likes.dto";

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService : CommentsService,
              protected jwtService : JwtService) {}
  @HttpCode(200)
  @Get(':id')
  async getComment(@Param('id') commentId : string,
                   @Req() req: any){
    const token = req.headers.authorization
    if (!token){
      const comment : CommentModel | null = await this.commentsService.getCommentById(req.params.id)
      if (!comment) {
        return errorHandler(ErrorCodes.NotFound)
      } else {
        return comment
      }
    } else {
      const token = req.headers.authorization!.split(" ")[1]
      let userId : string = await this.jwtService.getUserByIdToken(token);
      const comment = await this.commentsService.getCommentByIdWithUser(req.params.id, userId);
      if (!comment) {
        return errorHandler(ErrorCodes.NotFound)
      } else {
        return comment
      }
    }
  }
  @HttpCode(204)
  @UseGuards(CheckForExistingUser)
  @UseGuards(CheckCommentForUser)
  @Delete(':id')
  async deleteComment(@Param('id') commentId : string){
    const status = await this.commentsService.deleteCommentById(commentId);
    if (status) {
      return
    } else {
      return errorHandler(ErrorCodes.NotFound)
    }
  }
  @HttpCode(204)
  @UseGuards(CheckForExistingUser)
  @UseGuards(CheckCommentForUser)
  @Put(':id')
  async updateComment(@Param('id') commentId : string,
                      @Body() comment : CommentsDto){
    const status : boolean = await this.commentsService.updateCommentById(comment.content, commentId)
    if (status) {
      return
    } else {
      return errorHandler(ErrorCodes.NotFound)
    }
  }

  @HttpCode(204)
  @UseGuards(CheckCommentForUser)
  @UseGuards(CheckForExistingUser)
  @Put(':id/like-status')
  async changeLikeStatus(@Param('id') commentId : string,
                         @Body() requestType : LikesDto,
                         @Req() req: any){
    const token = req.headers.authorization!.split(" ")[1]
    let userId : string = await this.jwtService.getUserByIdToken(token);
    const status : boolean = await this.commentsService.changeLikeStatus(requestType.likeStatus, commentId, userId)
    if (status){
      return
    } else {
      return errorHandler(ErrorCodes.NotFound)
    }
  }
}