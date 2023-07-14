import { SecurityRepository } from "../repository/security.repository";
import { JwtService } from "../../../utils/jwt.service";
import { RefreshTokensMetaModel } from "../schemas/security.schema";
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
@Injectable()
export class SecurityService {
  constructor(protected securityRepository : SecurityRepository,
              protected jwtService : JwtService) {}
  async getAllSessions(refreshToken : string) : Promise<RefreshTokensMetaModel[] | null> {
    const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
    if(!idList) throw new NotFoundException();
    const userId = idList.userId
    const sessions : RefreshTokensMetaModel[] | null = await this.securityRepository.getAllSessions(userId)
    /*if (sessions.length === 0) throw new NotFoundException();*/
    return sessions
  }
  async deleteAllSessions(refreshToken : string) : Promise<boolean> {
    const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
    if(!idList) throw new UnauthorizedException()
    const status : boolean = await this.securityRepository.deleteAllSessions(idList.deviceId, idList.userId)
    if(!status) throw new UnauthorizedException()
    return true
  }
  async deleteOneSession(deviceId : string) : Promise<boolean> {
    return await this.securityRepository.deleteOneSessions(deviceId)
  }
}