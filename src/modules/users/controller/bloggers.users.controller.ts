import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CheckIfUserExist } from '../../../guards/auth.guard';
import { BloggersUsersService } from '../domain/bloggers.users.service';
import { Request } from 'express';
import { BanUserForBlogDto } from '../dto/users.dto';

@Controller('blogger/users/')
export class BloggersUsersController {
  constructor(protected usersService: BloggersUsersService) {}
  @HttpCode(204)
  @UseGuards(CheckIfUserExist)
  @Put(':userId/ban')
  async BanUserForBlog(
    @Param('userId') userId: string,
    @Body() banInfo: BanUserForBlogDto,
    @Req() req: Request,
  ) {
    if (!userId.match(/^\d+$/)) throw new NotFoundException();
    const token = req.headers.authorization!.split(' ')[1];
    const status: boolean = await this.usersService.BanUserForBlog(
      token,
      +userId + '',
      banInfo,
    );
    if (!status) throw new NotFoundException();
    return;
  }
  @HttpCode(200)
  @UseGuards(CheckIfUserExist)
  @Get('blog/:blogId')
  async GetAllBannedUsersForBlog(
    @Param('blogId') blogId: string,
    @Req() req: Request,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('pageNumber', new DefaultValuePipe(1)) pageNumber: number,
    @Query('sortBy', new DefaultValuePipe('banDate')) sortBy: string,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection: 'asc' | 'desc',
    @Query('searchLoginTerm', new DefaultValuePipe('')) searchLoginTerm: string,
  ) {
    if (!blogId.match(/^\d+$/)) throw new NotFoundException();
    const token = req.headers.authorization!.split(' ')[1];
    return await this.usersService.getAllBannedUsers(token, blogId, {
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortBy: sortBy,
      sortDirection: sortDirection,
      searchLoginTerm: searchLoginTerm,
    });
  }
}
