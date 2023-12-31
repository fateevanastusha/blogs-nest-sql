import { UsersRepository } from '../repository/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
export class DeleteUserUsersCommand {
  constructor(readonly userId: string) {}
}
@CommandHandler(DeleteUserUsersCommand)
export class DeleteUserUseCase
  implements ICommandHandler<DeleteUserUsersCommand>
{
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: DeleteUserUsersCommand): Promise<boolean> {
    if (!command.userId.match(/^\d+$/)) throw new NotFoundException();
    return await this.usersRepository.deleteUser(command.userId);
  }
}
