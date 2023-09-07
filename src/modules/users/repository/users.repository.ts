import {
  UserBanInfo,
  UserModel,
  UserModelCreate,
  UserViewModel,
} from '../schemas/users.schema';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getUsersCount(
    searchLoginTerm: string,
    searchEmailTerm: string,
    banStatus: boolean | undefined,
  ): Promise<number> {
    let count;
    if (banStatus === undefined) {
      count = await this.dataSource.query(`
      SELECT COUNT(*) AS "total"
      FROM public."Users"
      WHERE "login" ILIKE '%${searchLoginTerm}%' OR "email" ILIKE '%${searchEmailTerm}%'
    `);
    } else {
      count = await this.dataSource.query(`
      SELECT COUNT(*) AS "total"
      FROM public."Users"
      WHERE ("login" ILIKE '%${searchLoginTerm}%' OR "email" ILIKE '%${searchEmailTerm}%')AND "isBanned" = ${banStatus}
    `);
    }
    return Number(count[0].total);
  }
  async getFullUser(id: string): Promise<UserModel[]> {
    return await this.dataSource.query(`
    SELECT *
    FROM public."Users"
    WHERE id = ${id}
    `);
  }
  async returnUserByField(field: string): Promise<UserModel> {
    const user = await this.dataSource.query(`
    SELECT *
        FROM public."Users"
        WHERE "login" = '${field}' OR "email" = '${field}' OR "confirmedCode" = '${field}'
    `);
    if (user.length === 0) return null;
    return user[0];
  }
  async returnUserByEmail(email: string): Promise<UserModel[]> {
    return this.dataSource.query(`
    SELECT *
    FROM public."Users"
    WHERE email = '${email}'
    `);
  }
  async createUser(newUser: UserModelCreate): Promise<UserViewModel> {
    //SQL base insert
    await this.dataSource.query(`
    INSERT INTO public."Users"(
    "email", "login", "password", "createdAt", "confirmedCode")
    VALUES ('${newUser.email}', '${newUser.login}', '${newUser.password}','${newUser.createdAt}', '${newUser.confirmedCode}' );
    `);
    const createdUser = (
      await this.dataSource.query(`
      SELECT *
      FROM public."Users"
      WHERE "confirmedCode" = '${newUser.confirmedCode}'
    `)
    )[0];
    return {
      id: createdUser.id + '',
      createdAt: createdUser.createdAt,
      email: createdUser.email,
      login: createdUser.login,
    };
  }
  async checkForConfirmationCode(confirmedCode: string): Promise<boolean> {
    const user = await this.dataSource.query(`
        SELECT *
            FROM public."Users"
            WHERE "confirmedCode" = '${confirmedCode}'
    `);
    return user.length > 0;
  }
  async changeConfirmedStatus(confirmedCode: string): Promise<boolean> {
    await this.dataSource.query(`
        UPDATE public."Users" 
        SET "isConfirmed" = true
        WHERE "confirmedCode" = '${confirmedCode}'
    `);
    return true;
  }

  async changeConfirmationCode(
    confirmedCode: string,
    email: string,
  ): Promise<boolean> {
    const user = await this.returnUserByField(email);
    if (!user) return false;
    await this.dataSource.query(`
        UPDATE public."Users" 
        SET "confirmedCode" = '${confirmedCode}'
        WHERE "email" = '${email}'
    `);
    return true;
  }

  async checkForConfirmedAccountByEmailOrCode(
    emailOrCode: string,
  ): Promise<boolean> {
    const user = await this.dataSource.query(`
    SELECT *
        FROM public."Users"
        WHERE "confirmedCode" = '${emailOrCode}' OR "email" = '${emailOrCode}'
    `);
    return user[0].isConfirmed;
  }
  async changeUserPassword(code: string, password: string): Promise<boolean> {
    const user = await this.returnUserByField(code);
    if (!user) return false;
    await this.dataSource.query(`
        UPDATE public."Users" 
        SET "password" = '${password}'
        WHERE "confirmedCode" = '${code}'
    `);
    return true;
  }
  async banUser(userId: string, banInfo: UserBanInfo): Promise<boolean> {
    await this.dataSource.query(`
        UPDATE public."Users" 
        SET "isBanned" = ${banInfo.isBanned}, "banDate" = '${banInfo.banDate}', "banReason" = '${banInfo.banReason}'
        WHERE "id" = ${userId}
    `);
    return true;
  }
  async unbanUser(userId: string): Promise<boolean> {
    await this.dataSource.query(`
        UPDATE public."Users" 
        SET "isBanned" = false, "banDate" = null, "banReason" = null
        WHERE "id" = ${userId}
    `);
    return true;
  }
  async deleteUser(id: string): Promise<boolean> {
    await this.dataSource.query(`
    DELETE FROM public."Users"
        WHERE id = ${id};
    `);
    return true;
  }
}
