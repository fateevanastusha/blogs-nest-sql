import { Controller, Delete, Get, Req, UseGuards } from "@nestjs/common";
import { CheckForRefreshToken, CheckForSameUser } from "../auth.guard";
import { SecurityService } from "./security.service";

@Controller('posts')
export class PostsController{
  constructor(protected securityService : SecurityService) {}

  @UseGuards(CheckForRefreshToken)
  @Get()
  async getSessions(@Req() req: any){
    return await this.securityService.getAllSessions(req.cookies.refreshToken)
  }
  @Delete()
  async deleteSessions(@Req() req: any){
    return await this.securityService.deleteAllSessions(req.cookies.refreshToken)
  }
  @UseGuards(CheckForRefreshToken)
  @UseGuards(CheckForSameUser)
  @Delete()
  async deleteSession(@Req() req: any){
  return await this.securityService.deleteOneSession(req.cookies.refreshToken)
  }
}