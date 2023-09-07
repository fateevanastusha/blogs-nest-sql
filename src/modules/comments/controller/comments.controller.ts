import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsDto } from '../dto/comments dto';
import {
  CheckIfUserExist,
  CommentCheckForSameUser,
} from '../../../guards/auth.guard';
import { CommentViewModel } from '../schemas/comments.schema';
import { JwtService } from '../../../utils/jwt.service';
import { LikesDto } from '../../likes/dto/likes.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommentsCommand } from '../use-cases/comments-update-comment-use-case';
import { GetCommentCommentsCommand } from '../use-cases/comments-get-comment-use-case';
import { GetCommentWithUserCommentsCommand } from '../use-cases/comments-get-comment-with-user-use-case';
import { DeleteCommentCommentsCommand } from '../use-cases/comments-delete-comment-use-case';
import { ChangeLikeStatusCommentsCommand } from '../use-cases/comments-like-comment-use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    protected jwtService: JwtService,
    protected commandBus: CommandBus,
  ) {}
  @HttpCode(200)
  @Get(':id')
  async getComment(@Param('id') commentId: string, @Req() req: any) {
    if (!commentId.match(/^\d+$/)) throw new NotFoundException();
    const token = req.headers.authorization;
    if (!token) {
      const comment: CommentViewModel = await this.commandBus.execute(
        new GetCommentCommentsCommand(commentId),
      );
      return comment;
    } else {
      const token = req.headers.authorization!.split(' ')[1];
      const userId: string = await this.jwtService.getUserIdByToken(token);
      const comment: CommentViewModel = await this.commandBus.execute(
        new GetCommentWithUserCommentsCommand(userId, commentId),
      );
      return comment;
    }
  }
  @HttpCode(204)
  @UseGuards(CommentCheckForSameUser)
  @Delete(':id')
  async deleteComment(@Param('id') commentId: string) {
    if (!commentId.match(/^\d+$/)) throw new NotFoundException();
    return await this.commandBus.execute(
      new DeleteCommentCommentsCommand(commentId),
    );
  }
  @HttpCode(204)
  @UseGuards(CommentCheckForSameUser)
  @Put(':id')
  async updateComment(
    @Param('id') commentId: string,
    @Body() comment: CommentsDto,
  ) {
    if (!commentId.match(/^\d+$/)) throw new NotFoundException();
    return await this.commandBus.execute(
      new UpdateCommentCommentsCommand(comment.content, commentId),
    );
  }

  @HttpCode(204)
  @UseGuards(CheckIfUserExist)
  @Put(':id/like-status')
  async changeLikeStatus(
    @Param('id') commentId: string,
    @Body() requestType: LikesDto,
    @Req() req: any,
  ) {
    if (!commentId.match(/^\d+$/)) throw new NotFoundException();
    const token = req.headers.authorization!.split(' ')[1];
    const userId: string = await this.jwtService.getUserIdByToken(token);
    return await this.commandBus.execute(
      new ChangeLikeStatusCommentsCommand(
        requestType.likeStatus,
        commentId,
        userId,
      ),
    );
  }
}
