import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { Request, Response } from "express";
import { RefreshTokensMetaModel } from "../../security/security.schema";
import { UserModel } from "../../../superadmin/users/users.schema";
import { AttemptsModel } from "../../../../attempts/attempts.schema";
import { JwtService } from "../../../../jwt.service";
import { CommentsService } from "../../comments/comments.service";
import { AuthRepository } from "../auth.repository";
import { SecurityRepository } from "../../security/security.repository";
import { UsersRepository } from "../../../superadmin/users/users.repository";
import { SecurityService } from "../../security/security.service";
import { AttemptsRepository } from "../../../../attempts/attempts.repository";
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

