import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateBannedUserInfo } from '../../blogs/schemas/blogs.schema';

export class BannedUsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async banUser(banInfo: CreateBannedUserInfo): Promise<boolean> {
    await this.dataSource.query(`
    INSERT INTO public."BannedForBlogUser"(
      "userId", "banReason", "blogId", "banDate", "userLogin")
      VALUES (${banInfo.userId}, '${banInfo.banReason}', ${banInfo.blogId}, '${banInfo.banDate}', '${banInfo.userLogin}');
    `);
    const ban = await this.dataSource.query(`
    SELECT *
      FROM public."BannedForBlogUser"
      WHERE "banDate" = '${banInfo.banDate}'
    `);
    if (ban.length === 0) return false;
    return true;
  }
  async unbanUser(blogId: string, userId: string): Promise<boolean> {
    await this.dataSource.query(`
    DELETE FROM public."BannedForBlogUser"
        WHERE "blogId" = ${blogId} AND "userId" = ${userId};
    `);
    const ban = await this.dataSource.query(`
    SELECT *
      FROM public."BannedForBlogUser"
      WHERE "blogId" = ${blogId} AND "userId" = ${userId}
    `);
    if (ban.length > 0) return false;
    return true;
  }
  async getBannedUsersCount(blogId: string): Promise<number> {
    const count = await this.dataSource.query(`
        SELECT COUNT(*) AS "total"
          FROM public."BannedForBlogUser"
          WHERE "blogId" = ${blogId}
    `);
    return +count[0].total;
  }
  async findBan(userId: string, blogId: string): Promise<boolean> {
    const ban = await this.dataSource.query(`
      SELECT *
        FROM public."BannedForBlogUser"
        WHERE "blogId" = ${blogId} AND "userId" = ${userId}
    `);
    if (ban.length > 0) return true;
    return false;
  }
}
