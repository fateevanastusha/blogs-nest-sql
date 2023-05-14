import { UsersRepository } from "./users.repository";
import { UserModel } from "./users.schema";
import { QueryRepository } from "../helpers/query.repository";
import { QueryModelUsers } from "../helpers/helpers.schema";
import { PaginatedClass } from "../blogs/blogs.schema";
import { UsersDto } from "./users.dto";
import * as bcrypt from 'bcrypt';
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(protected usersRepository : UsersRepository,
              protected queryRepository : QueryRepository) {}
  async getUsers(query : QueryModelUsers) : Promise<PaginatedClass>{
    const total : number = await this.usersRepository.getUsersCount(query.searchLoginTerm, query.searchEmailTerm);
    const pageCount = Math.ceil( total / query.pageSize);
    const items : UserModel[] = await this.queryRepository.paginationForUsers(query);
    return this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async getUser(id : string) : Promise<UserModel | null>{
    return this.usersRepository.getUser(id)
  }
  async createUser(user : UsersDto, confirmedCode : string ) : Promise<UserModel | null>{
    const hash = bcrypt.hashSync(user.password, 10, )
    const newUser : UserModel =  {
      id: (+new Date()).toString(),
      login: user.login,
      email: user.email,
      password : hash,
      createdAt: new Date().toISOString(),
      isConfirmed: false,
      confirmedCode: confirmedCode
    }
    return await this.usersRepository.createUser(newUser)
  }
  async changeUserPassword(code : string, password : string) : Promise<boolean>{
    const hash = bcrypt.hashSync(password, 10, )
    return await this.usersRepository.changeUserPassword(code, hash)
  }
  async deleteUser(id: string) : Promise<boolean>{
    return await this.usersRepository.deleteUser(id)
  }
  async deleteAllData(){
    await this.usersRepository.deleteAllData()
  }
}