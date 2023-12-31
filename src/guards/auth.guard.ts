import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '../utils/jwt.service';
import { AuthRepository } from '../modules/auth/auth.repository';
import { RefreshTokensMetaModel } from '../modules/security/schemas/security.schema';
import { SecurityRepository } from '../modules/security/repository/security.repository';
import { UsersRepository } from '../modules/users/repository/users.repository';
import { CommentsRepository } from '../modules/comments/repository/comments.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (request.headers.authorization == 'Basic YWRtaW46cXdlcnR5') {
      return true;
    }
    throw new UnauthorizedException();
    return false;
  }
}
//Check if user exist
@Injectable()
export class CheckIfUserExist implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected usersRepository: UsersRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const [authType, token] = auth.split(' ');
    if (authType !== 'Bearer') throw new UnauthorizedException();
    const userId = await this.jwtService.getUserIdByToken(token);
    if (!userId) throw new UnauthorizedException();
    const user = await this.usersRepository.getFullUser(userId);
    if (user.length === 0) throw new UnauthorizedException();
    if (user[0].isBanned === true) throw new UnauthorizedException();
    return true;
  }
}

@Injectable()
export class CommentCheckForSameUser implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    private userRepo: UsersRepository,
    private commentsRepository: CommentsRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const commentId = req.params.id;
    if (!commentId.match(/^\d+$/)) throw new NotFoundException();
    if (!req.headers.authorization) throw new UnauthorizedException();
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const [authType, token] = auth.split(' ');
    if (authType !== 'Bearer') throw new UnauthorizedException();
    const userId = await this.jwtService.getUserIdByToken(token);
    if (!userId) throw new UnauthorizedException();
    const user = await this.userRepo.getFullUser(userId);
    if (!user) throw new UnauthorizedException();
    const comment = await this.commentsRepository.getCommentById(req.params.id);
    if (!comment) throw new NotFoundException();
    if (comment.userId !== userId) throw new ForbiddenException();
    else if (comment.userId !== userId) throw new ForbiddenException();
    return true;
  }
}
@Injectable()
export class CheckForRefreshToken implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected authRepository: AuthRepository,
    protected securityRepository: SecurityRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.cookies) throw new UnauthorizedException();
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    const isTokenBlocked: boolean = await this.authRepository.checkRefreshToken(
      refreshToken,
    );
    if (isTokenBlocked) throw new UnauthorizedException();
    const tokenList = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!tokenList) throw new UnauthorizedException();
    const session: RefreshTokensMetaModel[] =
      await this.securityRepository.findSessionByDeviceId(tokenList.deviceId);
    if (session.length === 0) throw new UnauthorizedException();
    return true;
  }
}
@Injectable()
export class CheckForSameUser implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected authRepository: AuthRepository,
    protected securityRepository: SecurityRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    const isTokenBlocked: boolean = await this.authRepository.checkRefreshToken(
      refreshToken,
    );
    if (isTokenBlocked) throw new UnauthorizedException();
    const tokenList = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!tokenList) throw new UnauthorizedException();
    const session: RefreshTokensMetaModel[] =
      await this.securityRepository.findSessionByDeviceId(req.params.id);
    if (session.length === 0) throw new NotFoundException();
    const userId = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!userId) throw new UnauthorizedException();
    if (!req.cookies.refreshToken) throw new UnauthorizedException();
    if (userId.userId !== Number(session[0].userId))
      throw new ForbiddenException();
    return true;
  }
}
