import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../repository/blogs.repository";
import { UserModel } from '../../users/schemas/users.schema';
import { NotFoundException } from '@nestjs/common';
import { BlogOwnerModel } from '../schemas/blogs.schema';
import { UsersRepository } from '../../users/repository/users.repository';


export class BingBlogBlogsCommand {
  constructor(public blogId : string, public userId : string) {}
}
@CommandHandler(BingBlogBlogsCommand)
export class BindBlogUseCase implements ICommandHandler<BingBlogBlogsCommand>{
  constructor(protected usersRepository : UsersRepository,
              protected blogsRepository : BlogsRepository
  ) {}
  async execute (command : BingBlogBlogsCommand) : Promise<boolean>{
    const user : UserModel[] | null = await this.usersRepository.getFullUser(command.userId)
    if (user.length === 0) throw new NotFoundException()
    await this.blogsRepository.getFullBlog(command.blogId)
    const userInfo : BlogOwnerModel = {
      userId : command.userId,
      userLogin : user[0].login
    }
    return await this.blogsRepository.bindUser(command.blogId, userInfo)
  }
}