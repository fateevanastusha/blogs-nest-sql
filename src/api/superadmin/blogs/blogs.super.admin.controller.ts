import {
  Body,
  Controller,
  DefaultValuePipe,
  Get, HttpCode, NotFoundException,
  Param,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { BlogsSuperAdminService } from "./blogs.super.admin.service";
import { AuthGuard } from "../../../auth.guard";
import { BanBlogDto } from "../../public/blogs/blogs.dto";

@UseGuards(AuthGuard)
@Controller('sa/blogs')
export class BlogsSuperAdminController {
  constructor(protected blogsService : BlogsSuperAdminService,) {}
  @Get()
  async getBlogs(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm : string){
    return await this.blogsService.getBlogs({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection,
      searchNameTerm : searchNameTerm
    })
  }
  @HttpCode(204)
  @Put(':blogId/ban')
  async banBlog(@Param('blogId') blogId : string,
                @Body() request : BanBlogDto){
    const status : boolean = await this.blogsService.banBlog(blogId, request)
    if(!status) throw new NotFoundException()
    return
  }
  @HttpCode(204)
  @Put(':id/bind-with-user/:userId')
  async bindBlogWithUser(@Param() params){
    const status : boolean = await this.blogsService.bindBlog(params.id, params.userId)
    if (!status) throw new NotFoundException()
    return
  }
}