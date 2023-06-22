import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserBanInfo, UserDocument, UserModel } from "./users.schema";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
@Injectable()
export class UsersRepository {
  constructor(@InjectModel('users') private usersModel: Model<UserDocument>,
              @InjectDataSource() protected dataSource : DataSource) {
  }
  async getUsersCount(searchLoginTerm : string, searchEmailTerm : string, banStatus) : Promise<number>{
    const count = await this.dataSource.query(`
    SELECT COUNT(*)
        AS "total"
        FROM public."Users"
        WHERE "login" LIKE '%${searchLoginTerm}%' AND "email" LIKE '%${searchEmailTerm}%' AND "isBanned" = ${banStatus}
    `)
    return count.total
  }
  async getBlogBannedUsersCount(bannedList : string[], searchLoginTerm : string) : Promise<number>{
    return this.usersModel.countDocuments({id: { $in: bannedList }, login: {$regex: searchLoginTerm, $options: 'i'} })
  }
  async getFullUser (id : string) : Promise<UserModel | null>{
    return this.dataSource.query(`
    SELECT *
    FROM public."Users"
    WHERE id = '${id}'
    `)
  }
  async getUserWithId(id : string) : Promise <UserModel | null> {
    this.dataSource.query(`
    SELECT id, email, login, "createdAt", "isBanned", "banDate", "banReason"
        FROM public."Users";
        WHERE "id" = ${id}
    `)
    return this.usersModel
      .findOne({id: id}, {_id: 0, password : 0,  isConfirmed: 0, confirmedCode : 0, __v: 0, banInfo : { _id: 0}})
  }
  async returnUserByField(field : string) : Promise <UserModel | null> {
    return this.dataSource.query(`
    SELECT *
        FROM public."Users"
        WHERE "login" = '${field}' OR "email" = '${field}'
    `)
  }
  async returnUserByEmail(email : string) : Promise <UserModel | null> {
    return this.dataSource.query(`
    SELECT *
    FROM public."Users"
    WHERE email = '${email}'
    `)
  }
  async createUser(newUser : UserModel): Promise <UserModel | null> {
    //SQL base insert
    this.dataSource.query(`
    INSERT INTO public."Users"(
    "email", "login", "password", "createdAt", "isConfirmed", "confirmedCode")
    VALUES ('${newUser.email}', '${newUser.login}', '${newUser.password}','${newUser.createdAt}', '${newUser.isConfirmed}', '${newUser.confirmedCode}' );
    `)
    const createdUser = await this.getUserWithId(newUser.id)
    if (createdUser) {
      return createdUser
    }
    return null
  }
  async getLoginById(id : string) : Promise <string> {
    const user = await this.dataSource.query(`
    SELECT *
    FROM public."Users"
    WHERE id = '${id}'
    `)
    if (!user) return 'login'
    return user.login
  }
  async checkForConfirmationCode (confirmedCode : string) : Promise<boolean> {
    const user = await this.dataSource.query(`
        SELECT *
            FROM public."Users"
            WHERE "confirmedCode" = '${confirmedCode}'
    `)
    return user !== null
  }
  async changeConfirmedStatus (confirmedCode : string) : Promise<boolean> {
    await this.dataSource.query(`
        UPDATE public."Users" 
        SET "isConfirmed" = true
        WHERE "confirmedCode" = '${confirmedCode}'
    `)
    return true
  }

  async changeConfirmationCode (confirmedCode : string, email : string) : Promise <boolean> {
    await this.dataSource.query(`
        UPDATE public."Users" 
        SET "confirmedCode" = '${confirmedCode}'
        WHERE "email" = '${email}'
    `)
    return true
  }

  async checkForConfirmedAccountByEmailOrCode (emailOrCode : string) : Promise <boolean> {
    const user = await this.dataSource.query(`
    SELECT *
        FROM public."Users"
        WHERE "confirmedCode" = '${emailOrCode}' OR "email" = '${emailOrCode}'
    `)
    return user.isConfirmed
  }
  async changeUserPassword(code : string, password : string) : Promise <boolean> {
    await this.dataSource.query(`
        UPDATE public."Users" 
        SET "password" = '${password}'
        WHERE "confirmedCode" = '${code}'
    `)
    return true
  }
  async banUser(userId : string, banInfo : UserBanInfo) : Promise<boolean>{
    await this.dataSource.query(`
        UPDATE public."Users" 
        SET "isBanned" = '${banInfo.isBanned}', "banDate" = '${banInfo.banDate}', "banReason" = '${banInfo.banReason}'
        WHERE "id" = ${userId}
    `)
    return true
  }
  async deleteUser(id: string) : Promise<boolean>{
    await this.dataSource.query(`
    DELETE FROM public."Users"
        WHERE id = ${id};
    `)
    return true
  }
  async deleteAllData(){
    await this.dataSource.query(`DELETE FROM public."Users"`)
    return true
  }
}