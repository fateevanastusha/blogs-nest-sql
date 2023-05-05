import { Body, Controller, DefaultValuePipe, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsDto } from "./posts.dto";
import { PostModel } from "./posts.schema";
import { ErrorCodes, errorHandler } from "../helpers/errors";

@Controller('posts')
export class PostsController{
  constructor(protected postsService : PostsService) {}
  @Get()
  async getPosts(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('asc')) sortDirection : "asc" | "desc",
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
  @Get(':id/comments')
  async getComments(@Param('id') postId : string){

  }
  @Delete(':id')
  async deletePost(@Param('id') postId : string){
    const status : boolean = await this.postsService.deletePost(postId)
    if (!status) return errorHandler(ErrorCodes.NotFound)
    return
  }
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
    @Param('id') postId : string){
    const status : boolean = await this.postsService.updatePost(post, postId)
    if (!status) return errorHandler(ErrorCodes.NotFound)
    return
  }
}