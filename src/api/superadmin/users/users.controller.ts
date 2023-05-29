import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { BanUserDto, UsersDto } from "./users.dto";
import { UserModel } from "./users.schema";
import { AuthGuard } from "../../../auth.guard";

@UseGuards(AuthGuard)
@Controller('api/sa/users')
export class UsersController{
  constructor(protected usersService : UsersService) {}
  @Get()
  async getUsers(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
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
  @Post()
  async createUser(@Body() user : UsersDto){
    const createdUser : UserModel | null = await this.usersService.createUser(user, (+new Date()).toString())
    if (!createdUser) throw new NotFoundException()
    return createdUser
  }
  @HttpCode(204)
  @Put('/:id/ban')
  async banUser(@Param('id') userId : string,
                @Body() banInfo : BanUserDto){
    const status : boolean = await this.usersService.banUser(userId, banInfo)
    if(!status) throw new NotFoundException()
    return
  }
  @HttpCode(204)
  @Delete(':id')
  async deleteUser(@Param('id') userId : string){
    const status : boolean = await this.usersService.deleteUser(userId)
    if (!status) throw new NotFoundException()
    return
  }
}