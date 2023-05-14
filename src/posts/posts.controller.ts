import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get, HttpCode,
  Param,
  Post,
  Put,
  Query, Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CommentsDto, PostsDto } from "./posts.dto";
import { PostModel } from "./posts.schema";
import { ErrorCodes, errorHandler } from "../helpers/errors";
import { Response } from "express";
import { AuthGuard } from "../auth.guard";
import { LikesDto } from "../likes/likes.dto";

@Controller('posts')
export class PostsController{
  constructor(protected postsService : PostsService) {}
  @Get()
  async getPosts(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 ){
    return await this.postsService.getPosts({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection,
    })
  }
  @Get(':id')
  async getPost(@Param('id') postId : string){
    const post : PostModel | null =  await this.postsService.getPost(postId)
    if (!post) return errorHandler(ErrorCodes.NotFound)
    return post
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') postId : string,
                   @Res() res : Response){
    const status : boolean = await this.postsService.deletePost(postId)
    if (!status) return errorHandler(ErrorCodes.NotFound)
    return res.sendStatus(204)
  }
  @UseGuards(AuthGuard)
  @Post()
  async createPost(
    @Body() post : PostsDto){
    const createdPost : PostModel | null = await this.postsService.createPost(post)
    if (!createdPost) return errorHandler(ErrorCodes.BadRequest)
    return createdPost
  }
  @Put(':id')
  async updatePost(
    @Body() post : PostsDto,
    @Param('id') postId : string,
    @Res() res : Response){
    const status : boolean = await this.postsService.updatePost(post, postId)
    if (!status) return errorHandler(ErrorCodes.NotFound)
    res.sendStatus(204)
    return
  }
  //COMMENTS 2 REQ + LIKES 1 REQ
  @Get(':id/comments')
  async getComments(@Param('id') postId : string,
                    @Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                    @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                    @Req() req: any){
    const token = req.headers.authorization!.split(" ")[1]
    return await this.postsService.getComments({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection,
    }, token, postId)
  }
  @Post(':id/comments')
  async postComment(@Param('id') postId : string,
                    @Body() comment : CommentsDto,
                    @Req() req: any){
    const token = req.headers.authorization!.split(" ")[1]
    return await this.postsService.createComment(postId, comment.content, token)
  }
  @HttpCode(204)
  @Put(':id/like-status')
  async setLike(@Param('id') postId : string,
                @Body() like : LikesDto,
                @Req() req: any){
    const token = req.headers.authorization!.split(" ")[1]
    const status : boolean = await this.postsService.changeLikeStatus(like.likeStatus, postId, token)
    if (!status){
      return errorHandler(ErrorCodes.NotFound)
    }
    return
  }

}