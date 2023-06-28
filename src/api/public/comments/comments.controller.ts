import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, Req, UseGuards } from "@nestjs/common";
import { CommentsDto } from "./comments dto";
import { CheckIfUserExist, CommentCheckForSameUser } from "../../../auth.guard";
import { CommentsService } from "./comments.service";
import { CommentModel, CommentViewModel } from "./comments.schema";
import { JwtService } from "../../../jwt.service";
import { LikesDto } from "../../../likes/likes.dto";

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService : CommentsService,
              protected jwtService : JwtService) {}
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
    if (status) {
      return
    } else {
      throw new NotFoundException()
    }
  }
  @HttpCode(204)
  @UseGuards(CommentCheckForSameUser)
  @Put(':id')
  async updateComment(@Param('id') commentId : number,
                      @Body() comment : CommentsDto){
    const status : boolean = await this.commentsService.updateCommentById(comment.content, commentId)
    console.log('comment ' ,comment);
    if (status) {
      return
    } else {
      throw new NotFoundException()
    }
  }

  @HttpCode(204)
  @UseGuards(CheckIfUserExist)
  @Put(':id/like-status')
  async changeLikeStatus(@Param('id') commentId : number,
                         @Body() requestType : LikesDto,
                         @Req() req: any){
    const token = req.headers.authorization!.split(" ")[1]
    let userId : number = await this.jwtService.getUserIdByToken(token);
    const status : boolean = await this.commentsService.changeLikeStatus(requestType.likeStatus, commentId, userId)
    if (status){
      return
    } else {
      throw new NotFoundException()
    }
  }
}