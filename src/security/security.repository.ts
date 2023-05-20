import { RefreshTokensMetaModel, RefreshTokensMetaDocument } from "./security.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogDocument } from "../blogs/blogs.schema";
import { Injectable } from "@nestjs/common";
@Injectable()
export class SecurityRepository {
  constructor(@InjectModel('refresh token meta') private refreshTokensMetaModel: Model<RefreshTokensMetaDocument>) {}
  async getAllSessions(userId : string) : Promise<RefreshTokensMetaModel[] | null> {
    return this.refreshTokensMetaModel
      .find({userId}, {_id: 0, __v: 0, userId : 0})
      .lean()
  }
  async deleteAllSessions(deviceId : string, userId : string) : Promise<boolean> {
    const result = await this.refreshTokensMetaModel
      .deleteMany({
        userId,
        deviceId : {$ne : deviceId}
      })
    return result.deletedCount > 0
  }
  async deleteOneSessions(deviceId : string) : Promise<boolean> {
    const result = await this.refreshTokensMetaModel
      .deleteOne({deviceId : deviceId})
    return result.deletedCount === 1
  }
  async createNewSession(refreshTokensMeta : RefreshTokensMetaModel) : Promise<boolean> {
    await this.refreshTokensMetaModel
      .insertMany({
        userId : refreshTokensMeta.userId,
        ip: refreshTokensMeta.ip,
        title: refreshTokensMeta.title,
        lastActiveDate: refreshTokensMeta.lastActiveDate,
        deviceId: refreshTokensMeta.deviceId
      });
    const createdSession = await this.findSessionByIp(refreshTokensMeta.ip);
    if (createdSession) return true;
    return false;


  }
  async findSessionByIp(ip : string) : Promise<RefreshTokensMetaModel | null> {
    return this.refreshTokensMetaModel
      .findOne({ip: ip})
  }
  async findSessionByDeviceId(deviceId: string) : Promise<RefreshTokensMetaModel | null> {
    return this.refreshTokensMetaModel
      .findOne({deviceId: deviceId})
  }
  async findSessionByDeviceIdAndUserId(userId : string, deviceId: string) : Promise<RefreshTokensMetaModel | null> {
    return this.refreshTokensMetaModel
      .findOne({userId : userId, deviceId: deviceId})
  }
  async updateSession(ip : string, title : string, lastActiveDate : string, deviceId : string) : Promise<boolean>{
    const result = await this.refreshTokensMetaModel
      .updateOne({deviceId : deviceId},
        {$set : {
            ip: ip,
            title: title,
            lastActiveDate: lastActiveDate,
            deviceId: deviceId
          }
        });
    return result.matchedCount === 1;
  }
  async getAll() : Promise<RefreshTokensMetaModel[]>{
    return await this.refreshTokensMetaModel.find({}).lean()
  }
  //DELETE ALL DATA
  async deleteAllData() {
    await this.refreshTokensMetaModel.deleteMany({});
    return [];
  }
  async checkSameDevice(title : string, userId : string) : Promise<boolean> {
    const result = await this.refreshTokensMetaModel.find({title: title, userId : userId})
    if (result) return true
    return false
  }
}