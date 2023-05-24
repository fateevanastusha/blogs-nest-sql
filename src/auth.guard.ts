import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException, HttpStatus, HttpException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { JwtService } from "./jwt.service";
import { CommentsService } from "./comments/comments.service";
import { AuthRepository } from "./auth/auth.repository";
import { RefreshTokensMetaModel } from "./security/security.schema";
import { SecurityRepository } from "./security/security.repository";
import { UserModel } from "./users/users.schema";
import { UsersRepository } from "./users/users.repository";
import { SecurityService } from "./security/security.service";
import { AuthService } from "./auth/auth.service";
import { AttemptsModel } from "./attempts/attempts.schema";
import { AttemptsRepository } from "./attempts/attempts.repository";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (request.headers.authorization == "Basic YWRtaW46cXdlcnR5") {
      return true;
    }
    throw new UnauthorizedException(401);
    return false;
  }
}
//Check if user exist
@Injectable()
export class CheckIfUserExist implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    private userRepo: UsersRepository) {}
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization
    if (!auth) throw new UnauthorizedException(401)
    const [authType, token] = auth.split(' ')
    if (authType !== 'Bearer') throw new UnauthorizedException(401)
    const userId = await this.jwtService.getUserIdByToken(token)
    if(!userId) throw new UnauthorizedException(401)
    const user = await this.userRepo.getUser(userId)
    if(!user) throw new UnauthorizedException(401)
    req.user = user
    return true
  }
}
//For DELETE and PUT comment request
@Injectable()
export class CommentCheckForSameUser implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    private userRepo: UsersRepository,
    private commentsService : CommentsService) {
  }
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.headers.authorization) throw new UnauthorizedException(401);
    const auth = req.headers.authorization
    if (!auth) throw new UnauthorizedException(401)
    const [authType, token] = auth.split(' ')
    if (authType !== 'Bearer') throw new UnauthorizedException(401)
    const userId = await this.jwtService.getUserIdByToken(token);
    if (!userId) throw new UnauthorizedException();
    const user = await this.userRepo.getUser(userId)
    if(!user) throw new UnauthorizedException(401)
    const comment = await this.commentsService.getCommentByIdWithUser(req.params.id, userId);
    if (!comment) throw new NotFoundException();
    else if (comment.commentatorInfo.userId !== userId) throw new ForbiddenException();
    return true
  }
}
@Injectable()
export class CheckForRefreshToken implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected authRepository: AuthRepository,
    protected securityRepository: SecurityRepository) {
  }
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if(!req.cookies) throw new UnauthorizedException()
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    const isTokenBlocked: boolean = await this.authRepository.checkRefreshToken(refreshToken);
    if (isTokenBlocked) throw new UnauthorizedException();
    const tokenList = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!tokenList) throw new UnauthorizedException();
    const session: RefreshTokensMetaModel | null = await this.securityRepository.findSessionByDeviceId(tokenList.deviceId);
    if (!session) throw new UnauthorizedException();
    const userId = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!userId) throw new UnauthorizedException();
    return true
  }
}

@Injectable()
export class CheckForSameUser implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected authRepository: AuthRepository,
    protected securityRepository: SecurityRepository) {
  }
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    const isTokenBlocked: boolean = await this.authRepository.checkRefreshToken(refreshToken);
    if (isTokenBlocked) throw new UnauthorizedException();
    const tokenList = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!tokenList) throw new UnauthorizedException();
    const session: RefreshTokensMetaModel | null = await this.securityRepository.findSessionByDeviceId(tokenList.deviceId);
    if (!session) throw new UnauthorizedException();
    const userId = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!userId) throw new UnauthorizedException();
    if (!req.cookies.refreshToken) throw new UnauthorizedException()
    if(userId.userId !== session.userId) throw new ForbiddenException()
    return true

  }
}
@Injectable()
export class CheckDeviceId implements CanActivate {
  constructor(protected securityRepository: SecurityRepository,
              protected jwtService : JwtService) {}
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const deviceId = req.params.id;
    const session = await this.securityRepository.findSessionByDeviceId(deviceId)
    if (!session) throw new NotFoundException()
    if (!req.cookies.refreshToken) throw new UnauthorizedException()
    const token = req.cookies.refreshToken
    const userId = await this.jwtService.getIdByRefreshToken(token)
    if (!userId) throw new UnauthorizedException()
    if(userId.userId !== session.userId) throw new ForbiddenException()
    return true
  }
}
@Injectable()
export class CheckForSameDevice implements CanActivate {
  constructor(
    protected authService: AuthService,
    protected securityService: SecurityService) {
  }
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const title: string = req.headers["user-agent"] || "unknown";
    const user: UserModel | null = await this.authService.authFindUser(req.body.loginOrEmail);
    if (!user) {
      throw new UnauthorizedException(401);
      return false;
    }
    const userId: string = user.id;
    const status: boolean = await this.securityService.checkForSameDevice(title, userId);
    if (!status) {
      throw new ForbiddenException();
      return false;
    }
    return true;
  }
}

@Injectable()
export class CheckAttempts implements CanActivate {
  constructor(
    protected attemptsRepository: AttemptsRepository) {
  }
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const timeLimit = new Date(new Date().getTime() - 10000);
    const countOfAttempts = await this.attemptsRepository.countOfAttempts(req.ip, req.url, timeLimit);
    if (countOfAttempts >= 5) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS)
      return false;
    }
    const attempt: AttemptsModel = {
      userIP: req.ip,
      url: req.url,
      time: new Date()
    };
    await this.attemptsRepository.addAttempts(attempt);
    return true;
  }
}
