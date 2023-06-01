import { UsersRepository } from "./users.repository";
import { UserBanInfo, UserModel, UserViewModel } from "./users.schema";
import { QueryRepository } from "../../../helpers/query.repository";
import { QueryModelUsers } from "../../../helpers/helpers.schema";
import { PaginatedClass } from "../../public/blogs/blogs.schema";
import { BanUserDto } from "./users.dto";
import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(protected usersRepository : UsersRepository,
              protected queryRepository : QueryRepository) {}
  async getUsers(query : QueryModelUsers) : Promise<PaginatedClass>{
    const total : number = await this.usersRepository.getUsersCount(query.searchLoginTerm, query.searchEmailTerm);
    const pageCount = Math.ceil( total / query.pageSize);
    const items : UserViewModel[] = await this.queryRepository.paginationForUsers(query);
    return this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async getUser(id : string) : Promise<UserModel | null>{
    return this.usersRepository.getFullUser(id)
  }
  async changeUserPassword(code : string, password : string) : Promise<boolean>{
    const hash = bcrypt.hashSync(password, 10, )
    return await this.usersRepository.changeUserPassword(code, hash)
  }
  async banUser(userId : string, banInfo : BanUserDto) : Promise<boolean> {
    const user = await this.usersRepository.getFullUser(userId)
    if(!user) throw new NotFoundException()
    let banInformation : UserBanInfo = {
      banDate: new Date().toISOString(),
      banReason: banInfo.banReason,
      isBanned: banInfo.isBanned
    }
    if(!banInfo.isBanned) {
      banInformation.banReason = null
      banInformation.banDate = null
    }
    return await this.usersRepository.banUser(userId, banInformation )
  }
  async deleteAllData(){
    await this.usersRepository.deleteAllData()
  }
}