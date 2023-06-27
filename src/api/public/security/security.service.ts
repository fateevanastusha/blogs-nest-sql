import { SecurityRepository } from "./security.repository";
import { JwtService } from "../../../jwt.service";
import { RefreshTokensMetaModel } from "./security.schema";
import { Injectable, NotFoundException } from "@nestjs/common";
@Injectable()
export class SecurityService {
  constructor(protected securityRepository : SecurityRepository,
              protected jwtService : JwtService) {}
  async getAllSessions(refreshToken : string) : Promise<RefreshTokensMetaModel[] | null> {
    const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
    if(!idList) return null
    const userId = idList.userId
    const sessions : RefreshTokensMetaModel[] | null = await this.securityRepository.getAllSessions(userId)
    if (!sessions) throw new NotFoundException();
    return sessions
  }
  async deleteAllSessions(refreshToken : string) : Promise<boolean> {
    const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
    if(!idList) throw new NotFoundException()
    const status : boolean = await this.securityRepository.deleteAllSessions(idList.deviceId, idList.userId)
    if(!status) throw new NotFoundException()
    return true
  }
  async deleteOneSession(deviceId : string) : Promise<boolean> {
    return await this.securityRepository.deleteOneSessions(deviceId)
  }
  async checkForSameDevice(title : string, userId : number) : Promise<boolean> {
    const status : boolean = await this.securityRepository.checkSameDevice(title,userId)
    if(!status) throw new NotFoundException()
    return true
  }
}