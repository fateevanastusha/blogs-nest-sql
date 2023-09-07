import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsDto } from '../dto/posts.dto';
import { Request } from 'express';
import { CheckIfUserExist } from '../../../guards/auth.guard';
import { LikesDto } from '../../likes/dto/likes.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommentsCommand } from '../../comments/use-cases/comments-create-comment-use-case';
import { GetPostPostsCommand } from '../use-cases/posts-get-post-use-case';
import { GetPostsCommand } from '../use-cases/posts-get-posts-use-case';
import { GetPostsWithUserCommand } from '../use-cases/posts-get-posts-with-user-use-case';
import { ChangeLikeStatusPostsCommand } from '../use-cases/posts-change-like-status-use-case';
import { GetCommentsByPostCommand } from '../../comments/use-cases/comments-get-comments-by-post-use-case';

@Controller('posts')
export class PostsController {
  constructor(protected commandBus: CommandBus) {}
  @Get()
  async getPosts(
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection: 'asc' | 'desc',
    @Req() req: any,
  ) {
    const query = {
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortBy: sortBy,
      sortDirection: sortDirection,
    };
    if (!req.headers.authorization) {
      return await this.commandBus.execute(new GetPostsCommand(query));
    } else {
      const token = req.headers.authorization!.split(' ')[1];
      return await this.commandBus.execute(
        new GetPostsWithUserCommand(query, token),
      );
    }
  }
  @Get(':id')
  async getPost(@Param('id') postId: string, @Req() req: Request) {
    if (!postId.match(/^\d+$/)) throw new NotFoundException();
    return await this.commandBus.execute(
      new GetPostPostsCommand(postId, req.headers.authorization),
    );
  }
  @Get(':id/comments')
  async getComments(
    @Param('id') postId: string,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection: 'asc' | 'desc',
    @Req() req: any,
  ) {
    if (!postId.match(/^\d+$/)) throw new NotFoundException();
    const query = {
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortBy: sortBy,
      sortDirection: sortDirection,
    };
    return await this.commandBus.execute(
      new GetCommentsByPostCommand(query, req.headers.authorization, postId),
    );
  }
  @UseGuards(CheckIfUserExist)
  @Post(':postId/comments')
  async postComment(
    @Param('postId') postId: string,
    @Body() comment: CommentsDto,
    @Req() req: any,
  ) {
    if (!postId.match(/^\d+$/)) throw new NotFoundException();
    const token = req.headers.authorization!.split(' ')[1];
    return await this.commandBus.execute(
      new CreateCommentCommentsCommand(postId, comment.content, token),
    );
  }
  @UseGuards(CheckIfUserExist)
  @HttpCode(204)
  @Put(':id/like-status')
  async changeLikeStatus(
    @Param('id') postId: string,
    @Body() like: LikesDto,
    @Req() req: any,
  ) {
    if (!postId.match(/^\d+$/)) throw new NotFoundException();
    const token = req.headers.authorization!.split(' ')[1];
    return await this.commandBus.execute(
      new ChangeLikeStatusPostsCommand(like.likeStatus, postId, token),
    );
  }
}
