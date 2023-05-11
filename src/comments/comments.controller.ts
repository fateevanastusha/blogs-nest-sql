import { Body, Controller, Delete, Get, Param, Put, UseGuards } from "@nestjs/common";
import { CommentsDto } from "./comments dto";
import { AuthGuard, CheckForExistingUser, CheckForUser } from "../auth.guard";
import { LocalStrategy } from "../auth/strategies/passport.strategy";

@Controller('comments')
export class CommentsController {
  @Get(':id')
  async getComment(@Param('id') commentId : string){

  }
  @UseGuards(CheckForExistingUser)
  @UseGuards(CheckForUser)
  @Delete(':id')
  async deleteComment(@Param('id') commentId : string){

  }
  @UseGuards(CheckForExistingUser)
  @UseGuards(CheckForUser)
  @Put(':id')
  async updateComment(@Param('id') commentId : string,
                      @Body() comment : CommentsDto){

  }
  @UseGuards(CheckForExistingUser)
  @Put(':id')
  async changeLikeStatus(@Param('id') commentId : string){

  }
}