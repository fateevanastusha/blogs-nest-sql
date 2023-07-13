import { UsersRepository } from "../repository/users.repository";
import { UserBanInfo, UserModel, UserViewModel } from "../schemas/users.schema";
import { QueryRepository } from "../../../utils/query.repository";
import { QueryModelUsers } from "../../../utils/query.schema";
import { PaginatedClass } from "../../blogs/schemas/blogs.schema";
import { BanUserDto } from "../dto/users.dto";
import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(protected usersRepository : UsersRepository,
              protected queryRepository : QueryRepository) {}
  async getUsers(query : QueryModelUsers) : Promise<PaginatedClass>{
    let total : number = await this.usersRepository.getUsersCount(query.searchLoginTerm, query.searchEmailTerm, query.banStatus);
    if(!total) total = 0
    const pageCount = Math.ceil( total / query.pageSize);
    const items : UserModel[] = await this.queryRepository.paginationForUsers(query);
    //mapping items
    const mappedItems = items.map(createdUser => {
      return {
        id : createdUser.id + '',
        createdAt : createdUser.createdAt,
        email : createdUser.email,
        login : createdUser.login,
        banInfo : {
          isBanned : createdUser.isBanned,
          banReason : createdUser.banReason,
          banDate : createdUser.banDate
        }
      }
    })
    return this.queryRepository.paginationForm(pageCount, total, mappedItems, query)
  }
  async getUser(id : string) : Promise<UserModel[] | null>{
    return this.usersRepository.getFullUser(id)
  }
  async changeUserPassword(code : string, password : string) : Promise<boolean>{
    const hash = bcrypt.hashSync(password, 10, )
    return await this.usersRepository.changeUserPassword(code, hash)
  }
  async banUser(userId : string, banInfo : BanUserDto) : Promise<boolean> {
    const user = await this.usersRepository.getFullUser(userId)
    if(!user) throw new NotFoundException()
    let banInformation : UserBanInfo
    if (banInfo.isBanned === true){
      banInformation = {
        banDate: new Date().toISOString(),
        banReason: banInfo.banReason,
        isBanned: true
      }
      return await this.usersRepository.banUser(userId, banInformation)
    }
    if (banInfo.isBanned === false){
      return await this.usersRepository.unbanUser(userId)
    }
  }
}