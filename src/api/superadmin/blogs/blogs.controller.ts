import {
  Controller,
  DefaultValuePipe,
  Get, NotFoundException,
  Param,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { AuthGuard } from "../../../auth.guard";

@UseGuards(AuthGuard)
@Controller('sa/blogs')
export class BlogsController{
  constructor(protected blogsService : BlogsService,) {}
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
  @Put(':id/bind-with-user/:userId')
  async bindBlogWithUser(
    @Param('id') blogId : string,
    @Param('userId') userId : string){
    const status : boolean = await this.blogsService.bindBlog(blogId, userId)
    if (!status) throw new NotFoundException()
    return
  }
}