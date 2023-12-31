import { RefreshTokensMetaModel } from '../schemas/security.schema';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
@Injectable()
export class SecurityRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getAllSessions(
    userId: string,
  ): Promise<RefreshTokensMetaModel[] | null> {
    return await this.dataSource.query(`
        SELECT "ip", "title", "lastActiveDate", "deviceId"
        FROM public."RefreshTokens"
        WHERE "userId" = ${userId}
    `);
  }
  async deleteAllSessions(deviceId: string, userId: string): Promise<boolean> {
    await this.dataSource.query(`
    DELETE FROM public."RefreshTokens"
        WHERE "userId" = ${userId} AND NOT ("deviceId" = '${deviceId}')
    `);
    return true;
  }
  async deleteOneSessions(deviceId: string): Promise<boolean> {
    const status = await this.dataSource.query(`
      SELECT * FROM public."RefreshTokens"
          WHERE "deviceId" = '${deviceId}';
    `);
    if (status.length === 0) return false;
    await this.dataSource.query(`
    DELETE FROM public."RefreshTokens"
        WHERE "deviceId" = '${deviceId}';
    `);
    return true;
  }
  async createNewSession(
    refreshTokensMeta: RefreshTokensMetaModel,
  ): Promise<boolean> {
    return this.dataSource.query(`
    INSERT INTO public."RefreshTokens"(
        "ip", "title", "lastActiveDate", "deviceId", "userId")
        VALUES ('${refreshTokensMeta.ip}', '${refreshTokensMeta.title}', '${refreshTokensMeta.lastActiveDate}', '${refreshTokensMeta.deviceId}', ${refreshTokensMeta.userId});
    `);
    const createdSession = await this.findSessionByIp(refreshTokensMeta.ip);
    if (createdSession[0]) return true;
    return false;
  }
  async findSessionByIp(ip: string): Promise<RefreshTokensMetaModel[]> {
    return await this.dataSource.query(`
        SELECT *
        FROM public."RefreshTokens"
        WHERE "ip" = '${ip}'
    `);
  }
  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<RefreshTokensMetaModel[]> {
    return await this.dataSource.query(`
        SELECT *
        FROM public."RefreshTokens"
        WHERE "deviceId" = '${deviceId}'
    `);
  }
  async updateSession(
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string,
  ): Promise<boolean> {
    await this.dataSource.query(`
    UPDATE public."RefreshTokens"
        SET ip='${ip}', title='${title}', "lastActiveDate"='${lastActiveDate}', "deviceId"='${deviceId}'
        WHERE "deviceId"='${deviceId}';
    `);
    return true;
  }
}
