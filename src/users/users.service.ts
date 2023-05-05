import { UsersRepository } from "./users.repository";
import { UserModel } from "./users.schema";
import { QueryRepository } from "../helpers/query.repository";
import { QueryModelUsers } from "../helpers/helpers.schema";
import { PaginatedClass } from "../blogs/blogs.schema";
import { UsersDto } from "./users.dto";
import bcrypt from "bcrypt"

export class UsersService {
  constructor(protected usersRepository : UsersRepository,
              protected queryRepository : QueryRepository) {}
  async getUsers(query : QueryModelUsers) : Promise<PaginatedClass>{
    const total = await this.usersRepository.getUsersCount(query.searchLoginTerm, query.searchEmailTerm);
    const pageCount = Math.ceil( total / query.pageSize);
    const items : UserModel[] = await this.queryRepository.paginationForUsers(query);
    return this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async createUser(user : UsersDto ) : Promise<UserModel | null>{
    const hash = bcrypt.hashSync(user.password, 10, )
    const newUser =  {
      id: (+new Date()).toString(),
      login: user.login,
      email: user.email,
      password : hash,
      createdAt: new Date().toISOString()
    }
    return await this.usersRepository.createUser(newUser)
  }
  async deleteUser(id: string) : Promise<boolean>{
    return await this.usersRepository.deleteUser(id)
  }
  async deleteAllData(){
    await this.usersRepository.deleteAllData()
  }
}