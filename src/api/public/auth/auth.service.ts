import { AuthRepository } from "./auth.repository";
import { UsersService } from "../../superadmin/users/users.service";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { JwtService } from "../../../jwt.service";
import { AccessToken, RefreshToken, RefreshTokensMetaModel, TokenList } from "../security/security.schema";
import { SecurityRepository } from "../security/security.repository";
import { UserModel } from "../../superadmin/users/users.schema";
import { BusinessService } from "../../../business.service";
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
@Injectable()
export class AuthService {
  constructor(
    protected authRepository : AuthRepository,
    protected usersService : UsersService,
    protected usersRepository : UsersRepository,
    protected jwtService : JwtService,
    protected securityRepository : SecurityRepository,
    protected businessService : BusinessService,

  ) {
  }

  async authRequest (password : string, ip : string, loginOrEmail : string, title : string) : Promise<TokenList | null> {
    //CHECK FOR CORRECT PASSWORD
    const status : boolean = await this.authRepository.authRequest(loginOrEmail, password)
    if (!status) throw new UnauthorizedException()
    //CHECK FOR USER
    const user : UserModel = await this.usersRepository.returnUserByField(loginOrEmail);
    if (!user) throw new UnauthorizedException();
    const isBanned = user.isBanned
    if(isBanned === true) throw new UnauthorizedException()
    //CREATE DEVICE ID
    const deviceId : string = (+new Date()).toString();
    //GET USER ID
    const userId : string = user.id;
    //GET TOKENS
    const refreshToken : RefreshToken = await this.jwtService.createJWTRefresh(userId, deviceId);
    const accessToken = await this.jwtService.createJWTAccess(userId)
    //GET DATE
    const date : string | null = await this.jwtService.getRefreshTokenDate(refreshToken.refreshToken)
    if (!date) throw new UnauthorizedException()
    //CREATE REFRESH TOKENS META
    const refreshTokenMeta : RefreshTokensMetaModel = {
      userId : userId,
      ip: ip,
      title: title,
      lastActiveDate: date,
      deviceId: deviceId
    }
    //CREATE NEW SESSION
    await this.securityRepository.createNewSession(refreshTokenMeta)
    //RETURN TOKENS
    return {
      accessToken : accessToken.accessToken,
      refreshToken : refreshToken.refreshToken
    }
  }
  async logoutRequest (refreshToken : string) : Promise<boolean> {
    //ADD REFRESH TO BLACK LIST
    const statusBlackList : boolean = await this.addRefreshTokenToBlackList(refreshToken)
    if (!statusBlackList) return false
    //GET USER ID AND DEVICE ID BY REFRESH TOKEN
    const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
    if (!idList) return false
    return await this.securityRepository.deleteOneSessions(idList.deviceId)

  }

  //CREATE NEW TOKENS

  async createNewToken (refreshToken : string, ip : string, title : string) : Promise<TokenList | null> {
    await this.authRepository.addRefreshTokenToBlackList(refreshToken)
    const session : RefreshTokensMetaModel | null = await this.securityRepository.findSessionByIp(ip)
    if (!session) return null
    const deviceId : string = session.deviceId
    const userId : string = await this.jwtService.getUserIdByToken(refreshToken)
    const user = await this.usersService.getUser(userId)
    if (user === null) return null
    const accessToken : AccessToken = await this.jwtService.createJWTAccess(userId)
    const newRefreshToken : RefreshToken = await this.jwtService.createJWTRefresh(userId, deviceId)
    const date : string | null = await this.jwtService.getRefreshTokenDate(newRefreshToken.refreshToken)
    if (!date) return null
    await this.securityRepository.updateSession(ip, title, date, deviceId)
    return {
      accessToken : accessToken.accessToken,
      refreshToken : newRefreshToken.refreshToken
    }
  }

  async addRefreshTokenToBlackList (refreshToken : string) : Promise<boolean> {
    return await this.authRepository.addRefreshTokenToBlackList(refreshToken)
  }


  //GET USER BY TOKEN

  async getUserByToken (token : string) : Promise<UserModel | null> {
    const userId : string = await this.jwtService.getUserIdByToken(token)
    const user : UserModel[] = await this.usersService.getUser(userId)
    if(user.length > 0) return user[0]
    return null
  }

  async authFindUser (loginOrEmail : string) : Promise<UserModel> {
    return await this.usersRepository.returnUserByField(loginOrEmail)
  }
  async checkForConfirmationCode (confirmationCode : string) : Promise <boolean>  {
    const statusOfCode : boolean = await this.usersRepository.checkForConfirmationCode(confirmationCode)
    if (!statusOfCode) throw new BadRequestException({ message : ['code is wrong'] })
    const statusOfConfirmed : boolean = await this.usersRepository.checkForConfirmedAccountByEmailOrCode(confirmationCode)
    if (statusOfConfirmed) throw new BadRequestException({ message : ['code is confirmed'] })
    const status = await this.usersRepository.changeConfirmedStatus(confirmationCode)
    return status
  }

  //CHANGE PASSWORD

  async changePasswordWithCode (confirmationCode : string, newPassword : string ) : Promise <boolean>  {
    return await this.usersService.changeUserPassword(confirmationCode, newPassword)
  }
  async updateConfirmationCode (confirmationCode : string, email : string) : Promise <boolean> {
    return this.usersRepository.changeConfirmationCode(confirmationCode,email)
  }
  async passwordRecovery (email : string) : Promise <boolean> {
    let confirmationCode : string = (+new Date()).toString()
    const status = await this.updateConfirmationCode(confirmationCode, email)
    if (!status) return false
    await this.businessService.sendRecoveryCode(email, confirmationCode)
    return true
  }

  async emailResending (email : string) : Promise <boolean> {
    //check email
    const user : UserModel[] = await this.usersRepository.returnUserByEmail(email)
    if(user.length === 0){
      throw new BadRequestException({ message : ['email is wrong'] })
      return false
    }
    if(user[0].isConfirmed === true){
      throw new BadRequestException({ message : ['email is confirmed'] })
      return false
    }
    //check for not confirmed
    const statusOfConfirmed : boolean = await this.usersRepository.checkForConfirmedAccountByEmailOrCode(email)
    if (statusOfConfirmed) {
      return false
    }
    let confirmationCode : string = (+new Date()).toString()
    //UPDATE CONFIRMATION CODE
    const status = await this.updateConfirmationCode(confirmationCode, email)
    if (!status) {
      return false
    }
    //SEND EMAIL
    await this.businessService.sendConfirmationCode(email, confirmationCode)
    return true
  }
  //GET INFORMATION ABOUT CURRENT USER
  async getInformationAboutCurrentUser (accessToken : string) : Promise <UserModel | null> {
    const getUser : UserModel | null = await this.getUserByToken(accessToken);
    if (getUser) return getUser;
    return null;
  }
}