import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { CommentsDto } from "./comments dto";

@Controller('comments')
export class CommentsController {
  @Get(':id')
  async getComment(@Param('id') commentId : string){

  }
  @Delete(':id')
  async deleteComment(@Param('id') commentId : string){

  }
  @Put(':id')
  async updateComment(@Param('id') commentId : string,
                      @Body() comment : CommentsDto){

  }
  @Put(':id')
  async changeLikeStatus(@Param('id') commentId : string){

  }
}