import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { UsersDto } from "../../../superadmin/users/users.dto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({ usernameField: 'loginOrEmail' });
    }
    async validate(loginOrEmail: string, password: string): Promise<UsersDto> {
      const user = await this.usersService.checkUserCredentials(
        loginOrEmail,
        password,
      );
      if (user.banInfo.isBanned) throw new UnauthorizedException(['User is banned']);
      if (!user) throw new UnauthorizedException()
      return user;
    }
}

