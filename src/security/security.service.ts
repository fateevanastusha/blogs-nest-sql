import { SecurityRepository } from "./security.repository";
import { JwtService } from "../jwt.service";
import { RefreshTokensMetaModel } from "./security.schema";
import { ErrorCodes, errorHandler } from "../helpers/errors";
import { HttpException, Injectable } from "@nestjs/common";
@Injectable()
export class SecurityService {
  constructor(protected securityRepository : SecurityRepository,
              protected jwtService : JwtService) {}
  async getAllSessions(refreshToken : string) : Promise<RefreshTokensMetaModel[] | null> {
    const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
    if(!idList) return null
    const userId = idList.userId
    const sessions : RefreshTokensMetaModel[] | null = await this.securityRepository.getAllSessions(userId)
    if (!sessions) {
      errorHandler(ErrorCodes.NotAutorized);
      return null
    }
    return sessions
  }
  async deleteAllSessions(refreshToken : string) : Promise<boolean> {
    const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
    if(!idList) {
      errorHandler(ErrorCodes.NotAutorized)
      return false
    }
    const status : boolean = await this.securityRepository.deleteAllSessions(idList.deviceId, idList.userId)
    if(!status) {
      errorHandler(ErrorCodes.NotAutorized)
      return false
    }
    return true

  }
  async deleteOneSession(deviceId : string) : Promise<boolean> {
    const status : boolean = await this.securityRepository.deleteOneSessions(deviceId)
    if(!status) {
      //errorHandler(ErrorCodes.NotAutorized)
      throw new HttpException({},473)
      return false
    }
    return true
  }
  async checkForSameDevice(title : string, userId : string) : Promise<boolean> {
    const status : boolean = await this.securityRepository.checkSameDevice(title,userId)
    if(!status) {
      errorHandler(ErrorCodes.NotAutorized)
      return false
    }
    return true
  }
}