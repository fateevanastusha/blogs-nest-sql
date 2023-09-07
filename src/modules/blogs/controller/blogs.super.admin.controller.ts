import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../guards/auth.guard';
import { BanBlogDto } from '../dto/blogs.dto';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogsSaBlogsCommand } from '../use-cases/blogs-get-blogs-sa-use-case';
import { BanBlogBlogsCommand } from '../use-cases/blogs-ban-blog-use-case';
import { BingBlogBlogsCommand } from '../use-cases/blogs-bind-blog-use-case';

@UseGuards(AuthGuard)
@Controller('sa/blogs')
export class BlogsSuperAdminController {
  constructor(protected commandBus: CommandBus) {}
  @Get()
  async getBlogs(
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection: 'asc' | 'desc',
    @Query('searchNameTerm', new DefaultValuePipe('')) searchNameTerm: string,
  ) {
    const query = {
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortBy: sortBy,
      sortDirection: sortDirection,
      searchNameTerm: searchNameTerm,
    };
    return await this.commandBus.execute(new GetBlogsSaBlogsCommand(query));
  }
  @HttpCode(204)
  @Put(':blogId/ban')
  async banBlog(@Param('blogId') blogId: string, @Body() request: BanBlogDto) {
    return await this.commandBus.execute(
      new BanBlogBlogsCommand(blogId, request),
    );
  }
  @HttpCode(204)
  @Put(':blogId/bind-with-user/:userId')
  async bindBlogWithUser(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    return await this.commandBus.execute(
      new BingBlogBlogsCommand(blogId, userId),
    );
  }
}
