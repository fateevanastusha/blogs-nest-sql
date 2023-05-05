import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument, UserModel } from "./users.schema";
import { Injectable } from "@nestjs/common";

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
  async getUserWithId(id : string) : Promise <UserModel | null> {
    return this.usersModel
      .findOne({id: id}, {_id: 0, password : 0,  isConfirmed: 0, confirmedCode : 0, __v: 0})

  }
  async createUser(newUser : UserModel) : Promise <UserModel | null> {
    await this.usersModel.insertMany([newUser])
    const updatedUser = await this.getUserWithId(newUser.id)
    if (updatedUser) {
      return updatedUser
    }
    return null
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