import { UserModel } from '../users/schemas/users.schema';
import { UsersRepository } from '../users/repository/users.repository';
import * as bcrypt from 'bcrypt';
import {
  RefreshToken,
  RefreshTokensBlocked,
  RefreshTokensMetaDocument,
} from '../security/schemas/security.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(
    protected usersRepository: UsersRepository,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async authRequest(loginOrEmail: string, password: string): Promise<boolean> {
    const user: UserModel = await this.usersRepository.returnUserByField(
      loginOrEmail,
    );
    if (!user) throw new UnauthorizedException();
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException();
    return true;
  }
  async checkRefreshToken(refreshToken: string): Promise<boolean> {
    const status: RefreshToken[] = await this.dataSource.query(`
    SELECT "refreshToken" FROM public."BlockedRefreshTokens" WHERE "refreshToken"='${refreshToken}'`);
    if (status.length === 0) return false;
    return true;
  }
  async addRefreshTokenToBlackList(refreshToken: string): Promise<boolean> {
    await this.dataSource.query(`
    INSERT INTO public."BlockedRefreshTokens"("refreshToken")
        VALUES ('${refreshToken}');
    `);
    return true;
  }
}
