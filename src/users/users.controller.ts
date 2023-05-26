import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Injectable, NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersDto } from "./users.dto";
import { UserModel } from "./users.schema";
import { Response } from "express";
import { AuthGuard } from "../auth.guard";
import { QueryRepository } from "../helpers/query.repository";

@Injectable()
@UseGuards(AuthGuard)
@Controller('users')
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
  @Delete(':id')
  async deleteUser(@Param('id') userId : string, @Res() res : Response){
    const status : boolean = await this.usersService.deleteUser(userId)
    if (!status) throw new NotFoundException()
    return res.sendStatus(204)
  }
  @Post()
  async createUser(
    @Body() user : UsersDto){

    const createdUser : UserModel | null = await this.usersService.createUser(user, (+new Date()).toString())
    if (!createdUser) throw new NotFoundException()
    return createdUser
  }
}