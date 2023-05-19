import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException, HttpStatus, HttpException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request, Response } from "express";
import { UsersService } from "./users/users.service";
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
import { PostsService } from "./posts/posts.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected authRepository: AuthRepository,
    protected securityRepository: SecurityRepository,
    protected usersRepository: UsersRepository) {
  }

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

  async CheckForDeviceId(req: Request, res: Response) {
    const deviceId: string = req.params.id;
    const session: RefreshTokensMetaModel | null = await this.securityRepository.findSessionByDeviceId(deviceId);
    if (!session) {
      throw new UnauthorizedException(404);
      return false;
    }
    return true;
  }

  async CheckForExistingEmail(req: Request, res: Response) {
    const User = await this.usersRepository.returnUserByEmail(req.body.email);
    if (!User) {
      throw new UnauthorizedException(204);
      return false;
    }
    return true;
  }

  async CheckForNotSamePassword(req: Request, res: Response) {
    const status: boolean = await this.authRepository.recoveryRequest(req.body.recoveryCode, req.body.newPassword);
    if (status) {
      throw new UnauthorizedException(401);
      return false;
    }
    return true;
  }
}

@Injectable()
export class CheckForExistingUser implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    private userRepo: UsersRepository) {
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization
    if (!auth) throw new UnauthorizedException(401)
    const [authType, token] = auth.split(' ')
    if (authType !== 'Bearer') throw new UnauthorizedException(401)
    const userId = await this.jwtService.getUserByIdToken(token)
    if(!userId) throw new UnauthorizedException(401)
    const user = await this.userRepo.getUser(userId)
    if(!user) throw new UnauthorizedException(401)
    req.user = user
    return true
  }
}

@Injectable()
export class CheckCommentForUser implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected commentsService: CommentsService) {
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.headers.authorization) throw new UnauthorizedException(401);
    const token: string = req.headers.authorization.split(" ")[1];
    const userId = await this.jwtService.getUserByIdToken(token);
    if (!userId) throw new UnauthorizedException();
    const comment = await this.commentsService.getCommentByIdWithUser(req.params.id, userId);
    if (!comment) throw new NotFoundException();
    else if (comment.commentatorInfo.userId === userId) {
      return true;
    } else {
      throw new ForbiddenException();
      return false;
    }
  }
}

@Injectable()
export class CheckPostForUser implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected postService: PostsService) {
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.headers.authorization) throw new UnauthorizedException(401);
    const token: string = req.headers.authorization.split(" ")[1];
    const userId = await this.jwtService.getUserByIdToken(token);
    if (!userId) throw new UnauthorizedException();
    const post = await this.postService.getPost(req.params.id);
    if (!post) throw new NotFoundException();
    return true;
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
    //CHECK FOR EXISTING REFRESH TOKEN
    console.log('a');
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
    //CHECK FOR EXISTING REFRESH TOKEN
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException(401);
      return false;
    }
    const isTokenBlocked: boolean = await this.authRepository.checkRefreshToken(refreshToken);
    if (isTokenBlocked) {
      throw new UnauthorizedException(401);
      return false;
    }
    const tokenList = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!tokenList) {
      throw new UnauthorizedException(401);
      return false;
    }
    const session: RefreshTokensMetaModel | null = await this.securityRepository.findSessionByDeviceId(tokenList.deviceId);
    if (!session) {
      throw new UnauthorizedException(401);
      return false;
    }
    const userId = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!userId) {
      throw new UnauthorizedException(401);
      return false;
    }
    return true;
  }
}

@Injectable()
export class CheckForSameUserForComment implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected authRepository: AuthRepository,
    protected securityRepository: SecurityRepository) {
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    //CHECK FOR EXISTING REFRESH TOKEN
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException(401);
      return false;
    }
    const isTokenBlocked: boolean = await this.authRepository.checkRefreshToken(refreshToken);
    if (isTokenBlocked) {
      throw new UnauthorizedException(401);
      return false;
    }
    const tokenList = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!tokenList) {
      throw new UnauthorizedException(401);
      return false;
    }
    const session: RefreshTokensMetaModel | null = await this.securityRepository.findSessionByDeviceId(tokenList.deviceId);
    if (!session) {
      throw new UnauthorizedException(401);
      return false;
    }
    const userId = await this.jwtService.getIdByRefreshToken(refreshToken);
    if (!userId) {
      throw new UnauthorizedException(401);
      return false;
    }
    return true;
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