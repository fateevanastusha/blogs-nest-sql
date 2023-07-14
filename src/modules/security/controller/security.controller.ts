import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CheckForRefreshToken, CheckForSameUser } from "../../../guards/auth.guard";
import { SecurityService } from "../domain/security.service";
import { SkipThrottle } from '@nestjs/throttler';



@SkipThrottle()
@Controller('security/devices')
export class SecurityController{
  constructor(protected securityService : SecurityService) {}

  @UseGuards(CheckForRefreshToken)
  @Get('/')
  async getSessions(@Req() req: any){
    return await this.securityService.getAllSessions(req.cookies.refreshToken)
  }
  @HttpCode(204)
  @Delete()
  async deleteSessions(@Req() req: any){
    const status : boolean = await this.securityService.deleteAllSessions(req.cookies.refreshToken)
    if (!status) throw new UnauthorizedException();
    return;
  }
  @HttpCode(204)
  @UseGuards(CheckForRefreshToken)
  @UseGuards(CheckForSameUser)
  @Delete(':id')
  async deleteSession(@Param('id') deviceId : string){
    const status : boolean = await this.securityService.deleteOneSession(deviceId);
    if (!status) throw new NotFoundException();
    return;
  }
}