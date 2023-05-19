import { Controller, Delete, Get, Param, Req, UseGuards } from "@nestjs/common";
import { CheckForRefreshToken, CheckForSameUser } from "../auth.guard";
import { SecurityService } from "./security.service";

@Controller('security/devices')
export class SecurityController{
  constructor(protected securityService : SecurityService) {}

  @UseGuards(CheckForRefreshToken)
  @Get('/')
  async getSessions(@Req() req: any){
    console.log('security ', req.cookies.refreshToken);
    return await this.securityService.getAllSessions(req.cookies.refreshToken)
  }
  @Delete()
  async deleteSessions(@Req() req: any){
    return await this.securityService.deleteAllSessions(req.cookies.refreshToken)
  }
  @UseGuards(CheckForRefreshToken)
  @UseGuards(CheckForSameUser)
  @Delete(':id')
  async deleteSession(@Req() req: any,
                      @Param('id') deviceId : string){
  return await this.securityService.deleteOneSession(req.cookies.refreshToken)
  }
}