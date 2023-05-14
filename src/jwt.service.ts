import * as jwt from 'jsonwebtoken';
import { Injectable } from "@nestjs/common";
import { AccessToken, RefreshToken } from "./security/security.schema";
import { settings } from "./settings";

@Injectable()
export class JwtService {
  async createJWTAccess (userId : string) : Promise <AccessToken>{
    const accessToken = jwt.sign({ userId : userId }, settings.JWT_SECRET, { expiresIn: '10m' })
    return {
      accessToken : accessToken
    }
  }
  async createJWTRefresh (userId : string, deviceId: string) : Promise <RefreshToken>{
    const refreshToken = jwt.sign({ userId : userId, deviceId: deviceId }, settings.JWT_SECRET, { expiresIn: '20m' })
    return {
      refreshToken : refreshToken
    }
  }
  async getUserByIdToken (token : string) {

    try {
      const decoded : any = jwt.verify(token, settings.JWT_SECRET);
      return decoded.userId
    } catch (error) {
      return null
    }
  }
  async getIdByRefreshToken (token : string) {

    try {
      const decoded : any = jwt.verify(token, settings.JWT_SECRET);
      console.log(decoded)
      return {
        userId : decoded.userId,
        deviceId : decoded.deviceId
      }
    } catch (error) {
      return null
    }
  }
  async getRefreshTokenDate (token : string) {
    try {
      const decoded : any = jwt.verify(token, settings.JWT_SECRET);
      return new Date(decoded.iat * 1000).toISOString()
    } catch (error) {
      return null
    }
  }
}

