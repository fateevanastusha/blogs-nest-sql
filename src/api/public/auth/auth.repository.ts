import { UserModel } from "../../superadmin/users/users.schema";
import { UsersRepository } from "../../superadmin/users/users.repository";
import * as bcrypt from 'bcrypt';
import { RefreshToken, RefreshTokensBlocked, RefreshTokensMetaDocument } from "../security/security.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class AuthRepository {
  constructor(protected usersRepository : UsersRepository,
              @InjectDataSource() protected dataSource : DataSource) {}
  async authRequest(loginOrEmail: string, password: string) : Promise <boolean> {
    const user : UserModel = await this.usersRepository.returnUserByField(loginOrEmail)
    if (user) return bcrypt.compareSync(password, user.password)
    return false
  }
  async checkRefreshToken(refreshToken : string) : Promise <boolean> {
    const status : RefreshToken | null =  await this.dataSource.query(`
    SELECT "refreshToken" FROM public."BlockedRefreshTokens" WHERE "refreshToken"='${refreshToken}'`)
    if (status[0]) return true
    return false
  }
  async addRefreshTokenToBlackList(refreshToken : string) : Promise <boolean> {
    await this.dataSource.query(`
    INSERT INTO public."BlockedRefreshTokens"("refreshToken")
        VALUES ('${refreshToken}');
    `)
    return true
  }
}