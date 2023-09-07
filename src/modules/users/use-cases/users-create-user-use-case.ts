import {
  UserModel,
  UserModelCreate,
  UserViewModel,
} from '../schemas/users.schema';
import { UsersDto } from '../dto/users.dto';
import { UsersRepository } from '../repository/users.repository';
import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BusinessService } from '../../../mail/business.service';

export class CreateUserUsersCommand {
  constructor(public user: UsersDto) {}
}
@CommandHandler(CreateUserUsersCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserUsersCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected businessService: BusinessService,
  ) {}
  async execute(command: CreateUserUsersCommand): Promise<UserViewModel> {
    const confirmationCode: string = (+new Date()).toString();
    const hash = bcrypt.hashSync(command.user.password, 10);
    const newUser: UserModelCreate = {
      login: command.user.login,
      email: command.user.email,
      password: hash,
      createdAt: new Date().toISOString(),
      confirmedCode: confirmationCode,
    };
    await this.businessService.sendConfirmationCode(
      command.user.email,
      confirmationCode,
    );
    return await this.usersRepository.createUser(newUser);
  }
}
