import { Body, Controller, DefaultValuePipe, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersDto } from "./users.dto";

@Controller('users')
export class UsersController{
  constructor(protected usersService : UsersService
  ) {}
  @Get()
  async getUsers(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('asc')) sortDirection : "asc" | "desc",
                 @Query('searchLoginTerm', new DefaultValuePipe('')) searchLoginTerm : string,
                 @Query('searchEmailTerm', new DefaultValuePipe('')) searchEmailTerm : string,
  ){
    return await this.usersService.getUsers({
      pageSize : pageSize,
      pageNumber : pageNumber,
      sortBy : sortBy,
      sortDirection : sortDirection,
      searchLoginTerm : searchLoginTerm,
      searchEmailTerm : searchEmailTerm
    })
  }
  @Delete(':id')
  async deleteUser(@Param('id') userId : string){
    return await this.usersService.deleteUser(userId)
  }
  @Post()
  async createUser(
    @Body() user : UsersDto){
    return await this.usersService.createUser(user)
  }
}