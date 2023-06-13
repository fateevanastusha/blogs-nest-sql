import { UserModel } from "../../superadmin/users/users.schema";
import { UsersRepository } from "../../superadmin/users/users.repository";
import * as bcrypt from 'bcrypt';
import { RefreshToken, RefreshTokensBlocked, RefreshTokensMetaDocument } from "../security/security.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthRepository {
  constructor(protected usersRepository : UsersRepository,
              @InjectModel('refresh token meta') private refreshTokensMetaModel: Model<RefreshTokensMetaDocument>,
              @InjectModel('refresh token blocked') private refreshTokensBlocked : Model <RefreshTokensBlocked>) {}
  async authRequest(loginOrEmail: string, password: string) : Promise <boolean> {
    const user : UserModel | null = await this.usersRepository.returnUserByField(loginOrEmail)
    if (user) return bcrypt.compareSync(password, user.password)
    return false
  }
  async checkRefreshToken(refreshToken : string) : Promise <boolean> {
    const status : RefreshToken | null =  await this.refreshTokensBlocked.findOne({refreshToken : refreshToken})
    if (status) return true
    return false
  }
  async addRefreshTokenToBlackList(refreshToken : string) : Promise <boolean> {
    await this.refreshTokensBlocked.insertMany({refreshToken : refreshToken})
    const status = await this.checkRefreshToken(refreshToken)
    if (status) return true
    return false
  }
}