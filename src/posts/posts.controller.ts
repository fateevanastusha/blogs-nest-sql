import { Body, Controller, DefaultValuePipe, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsDto } from "./posts.dto";

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
    return await this.postsService.getPost(postId)
  }
  @Get(':id/comments')
  async getComments(@Param('id') postId : string){

  }
  @Delete(':id')
  async deletePost(@Param('id') postId : string){
    return await this.postsService.deletePost(postId)
  }
  @Post()
  async createPost(
    @Body() post : PostsDto){
    return await this.postsService.createPost(post)
  }
  @Put(':id')
  async updatePost(
    @Body() post : PostsDto,
    @Param('id') postId : string){
    return await this.postsService.updatePost(post, postId)
  }
}