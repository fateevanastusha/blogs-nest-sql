import { Controller, Delete, Get, NotFoundException, Param, Req, UseGuards } from "@nestjs/common";
import { CheckForRefreshToken, CheckForSameUser } from "../auth.guard";
import { SecurityService } from "./security.service";

@Controller('security/devices')
export class SecurityController{
  constructor(protected securityService : SecurityService) {}

  @UseGuards(CheckForRefreshToken)
  @Get('/')
  async getSessions(@Req() req: any){
    return await this.securityService.getAllSessions(req.cookies.refreshToken)
  }
  @Delete()
  async deleteSessions(@Req() req: any){
    const status : boolean = await this.securityService.deleteAllSessions(req.cookies.refreshToken)
    if (!status) throw new NotFoundException();
    return;
  }
  @UseGuards(CheckForRefreshToken)
  @UseGuards(CheckForSameUser)
  @Delete(':id')
  async deleteSession(@Req() req: any,
                      @Param('id') deviceId : string){
    const status : boolean = await this.securityService.deleteOneSession(req.cookies.refreshToken);
    if (!status) throw new NotFoundException();
    return;
  }
}