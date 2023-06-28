import { UsersRepository } from "../../superadmin/users/users.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
export class DeleteUserUsersCommand {
  constructor(readonly userId : number) {
  }
}
@CommandHandler(DeleteUserUsersCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserUsersCommand>{
  constructor( private usersRepository : UsersRepository) {}
  async execute (command : DeleteUserUsersCommand) : Promise<Boolean>{
    return await this.usersRepository.deleteUser(command.userId)
  }
}