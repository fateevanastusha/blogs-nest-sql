import { UserModel } from "../users/users.schema";
import { UsersRepository } from "../users/users.repository";
import bcrypt from "bcrypt";
import { RefreshToken, RefreshTokensMetaDocument } from "../security/security.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthRepository {
  constructor(protected usersRepository : UsersRepository, @InjectModel('refresh token meta') private refreshTokensMetaModel: Model<RefreshTokensMetaDocument>) {}
  //AUTH

  async authRequest(loginOrEmail: string, password: string) : Promise <boolean> {

    //find by loginOrEmail

    const user : UserModel | null = await this.usersRepository.returnUserByField(loginOrEmail)
    if (user) {
      return bcrypt.compareSync(password, user.password)
    } else {
      return false
    }
  }

  async recoveryRequest(recoveryCode: string, password: string) : Promise <boolean> {

    const user : UserModel | null = await this.usersRepository.returnUserByField(recoveryCode)
    if (user) {
      return bcrypt.compareSync(password, user.password)
    } else {
      return false
    }
  }

  //CHECK FOR REFRESH TOKEN IN BLACK LIST

  async checkRefreshToken(refreshToken : string) : Promise <boolean> {
    //find by loginOrEmail
    const status : RefreshToken | null =  await this.refreshTokensMetaModel.findOne({refreshToken : refreshToken})
    if (status) {
      return true
    } else {
      return false
    }
  }

  //ADD REFRESH TOKEN TO BLACK LIST

  async addRefreshTokenToBlackList(refreshToken : string) : Promise <boolean> {
    //find by loginOrEmail
    await this.refreshTokensMetaModel.insertMany({refreshToken : refreshToken})
    const status = await this.checkRefreshToken(refreshToken)
    if (status) {
      return true
    } else {
      return false
    }
  }

}