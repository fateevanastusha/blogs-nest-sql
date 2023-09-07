import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogViewModel, CreateBlogModel } from '../schemas/blogs.schema';
import { JwtService } from '../../../utils/jwt.service';
import { UsersRepository } from '../../users/repository/users.repository';
import { BlogDto } from '../dto/blogs.dto';
import { BlogsRepository } from '../repository/blogs.repository';

export class CreateBlogByAdminBlogsCommand {
  constructor(public blog: BlogDto) {}
}

@CommandHandler(CreateBlogByAdminBlogsCommand)
export class CreateBlogByAdminUseCase
  implements ICommandHandler<CreateBlogByAdminBlogsCommand>
{
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private blogsRepository: BlogsRepository,
  ) {}
  async execute(
    command: CreateBlogByAdminBlogsCommand,
  ): Promise<BlogViewModel> {
    let adminId
    const admin = await this.usersRepository.returnUserByField('admin')
    if (!admin) {
      const createdAdmin = await this.usersRepository.createUser({
        login : 'admin',
        email : 'admin@gmail.com',
        password : 'qwerty',
        confirmedCode : 'no code',
        createdAt : new Date().toISOString()})
      adminId = createdAdmin.id
    } else {
      adminId = admin.id
    }
    const { blog } = command;
    const newBlog: CreateBlogModel = {
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date().toISOString(),
      userId: adminId,
      userLogin: 'admin',
    };
    const result = await this.blogsRepository.createBlog(newBlog);
    result[0].id = result[0].id + '';
    return result[0];
  }
}
