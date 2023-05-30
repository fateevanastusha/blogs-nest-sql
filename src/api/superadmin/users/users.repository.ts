import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserBanInfo, UserDocument, UserModel } from "./users.schema";
import { Injectable } from "@nestjs/common";
import { BanUserDto } from "./users.dto";

@Injectable()
export class UsersRepository {
  constructor(@InjectModel('users') private usersModel: Model<UserDocument> ) {
  }
  async getUsersCount(searchLoginTerm : string, searchEmailTerm : string) : Promise<number>{
    return this.usersModel.countDocuments({
      $or: [
        {login: {$regex: searchLoginTerm, $options: 'i'}},
        {email: {$regex: searchEmailTerm, $options: 'i'}}
      ]
    })
  }
  async getUser (id : string) : Promise<UserModel | null>{
    return this.usersModel.findOne({id: id}, {_id: 0, __v: 0})
  }
  async getUserWithId(id : string) : Promise <UserModel | null> {
    return this.usersModel
      .findOne({id: id}, {_id: 0, password : 0,  isConfirmed: 0, confirmedCode : 0, __v: 0})

  }
  async returnUserByField(field : string) : Promise <UserModel | null> {
    const user = await this.usersModel
      .findOne({$or : [{login: field} , {email: field}]})
    return user
  }
  async returnUserByEmail(email : string) : Promise <UserModel | null> {
    const user =  this.usersModel
      .findOne({email : email},{_id: 0, __v: 0})
    return user
  }
  async createUser(newUser : UserModel) : Promise <UserModel | null> {
    await this.usersModel.insertMany(newUser)
    const createdUser = await this.getUserWithId(newUser.id)
    if (createdUser) {
      return createdUser
    }
    return null
  }
  async getLoginById(id : string) : Promise <string> {
    const user = await this.usersModel
      .findOne({id: id}, {_id: 0, password : 0,  isConfirmed: 0, confirmedCode : 0, __v: 0})
    if (!user) return 'login'
    return user.login
  }
  async checkForConfirmationCode (confirmedCode : string) : Promise<boolean> {
    const user = await this.usersModel.findOne({confirmedCode : confirmedCode})
    return user !== null
  }

  //CHANGE CONFIRMATION STATUS

  async changeConfirmedStatus (confirmedCode : string) : Promise<boolean> {
    const status = await this.usersModel.updateOne(
      {confirmedCode : confirmedCode},
      { $set : {
          isConfirmed : true
        }
      })
    return status.matchedCount === 1
  }

  //CHANGE CONFIRMATION CODE

  async changeConfirmationCode (confirmationCode : string, email : string) : Promise <boolean> {
    const status = await this.usersModel.updateOne(
      {email : email},
      { $set : {
          confirmedCode : confirmationCode
        }
      })
    return status.matchedCount === 1
  }

  //CHECK FOR CONFIRMED ACCOUNT

  async checkForConfirmedAccountByEmailOrCode (emailOrCode : string) : Promise <boolean> {
    const user = await this.usersModel.findOne({$or: [{email: emailOrCode}, {confirmedCode: emailOrCode}]})
    if (user?.isConfirmed) {
      return true
    } else {
      return false
    }
  }
  async changeUserPassword(code : string, password : string) : Promise <boolean> {
    const result = await this.usersModel.updateOne({confirmedCode: code}, {$set :
        {
          password: password
        }
    })
    return result.matchedCount === 1
  }
  async banUser(userId : string, banInfo : UserBanInfo) : Promise<boolean>{
    const result = await this.usersModel.updateOne({id: userId}, {$set : { banInfo : {
          isBanned : banInfo.isBanned,
          banDate : banInfo.banDate,
          banReason : banInfo.banReason
        } } })
    return result.matchedCount === 1
  }
  async deleteUser(id: string) : Promise<boolean>{
    const result = await this.usersModel.deleteOne({id: id, __v: 0})
    return result.deletedCount === 1
  }
  async deleteAllData(){
    await this.usersModel.deleteMany({})
    return []
  }

}