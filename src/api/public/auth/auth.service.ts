import { AuthRepository } from "./auth.repository";
import { UsersService } from "../../superadmin/users/users.service";
import { UsersRepository } from "../../superadmin/users/users.repository";
import { JwtService } from "../../../jwt.service";
import { AccessToken, RefreshToken, RefreshTokensMetaModel, TokenList } from "../security/security.schema";
import { SecurityRepository } from "../security/security.repository";
import { UserModel } from "../../superadmin/users/users.schema";
import { BusinessService } from "../../../business.service";
import { UsersDto } from "../../superadmin/users/users.dto";
import { BadRequestException, Injectable } from "@nestjs/common";
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
    if (!status) return null
    //CHECK FOR USER
    const user : UserModel | null = await this.authFindUser(loginOrEmail);
    if (!user) return null;
    if(!user.banInfo.isBanned) return null
    //CREATE DEVICE ID
    const deviceId : string = (+new Date()).toString();
    //GET USER ID
    const userId : string = user.id;
    //GET TOKENS
    const refreshToken : RefreshToken = await this.jwtService.createJWTRefresh(userId, deviceId);
    const accessToken = await this.jwtService.createJWTAccess(userId)
    //GET DATE
    const date : string | null = await this.jwtService.getRefreshTokenDate(refreshToken.refreshToken)
    if (!date) return null
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
    const user : UserModel | null = await this.usersService.getUser(userId)
    return user
  }

  //FIND USER BY LOGIN OR EMAIL

  async authFindUser (loginOrEmail : string) : Promise<UserModel | null> {
    return await this.usersRepository.returnUserByField(
      loginOrEmail
    )
  }
  async checkForConfirmationCode (confirmationCode : string) : Promise <boolean>  {
    //check for existing confirmation code
    const statusOfCode : boolean = await this.usersRepository.checkForConfirmationCode(confirmationCode)
    if (!statusOfCode) {
      throw new BadRequestException({ message : ['code is wrong'] })
      return false
    }
    //check for not confirmed
    const statusOfConfirmed : boolean = await this.usersRepository.checkForConfirmedAccountByEmailOrCode(confirmationCode)
    if (statusOfConfirmed) {
      throw new BadRequestException({ message : ['code is confirmed'] })
      return false
    }
    return await this.usersRepository.changeConfirmedStatus(confirmationCode)
  }

  //CHANGE PASSWORD

  async changePasswordWithCode (confirmationCode : string, newPassword : string ) : Promise <boolean>  {
    //change confirmed code
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
    const user : UserModel | null = await this.usersRepository.returnUserByEmail(email)
    if(!user){
      throw new BadRequestException({ message : ['email is wrong'] })
      return false
    }
    if(user.isConfirmed === true){
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

    const getUser : UserModel | null = await this.getUserByToken(accessToken)

    if (getUser) {
      return getUser
    }
    else {
      return null
    }

  }
}