import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Observable } from 'rxjs';
import { Request } from "express";
import { UsersService } from "./users/users.service";
import { JwtService } from "./jwt.service";
import { CommentsService } from "./comments/comments.service";
import { AuthRepository } from "./auth/auth.repository";
import { RefreshTokensMeta } from "./security/security.schema";
import { SecurityRepository } from "./security/security.repository";
import { UserModel } from "./users/users.schema";
import { UsersRepository } from "./users/users.repository";
import { SecurityService } from "./security/security.service";
import { AuthService } from "./auth/auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(protected usersService : UsersService,
              protected jwtService : JwtService,
              protected commentsService : CommentsService,
              protected authRepository : AuthRepository,
              protected securityRepository : SecurityRepository,
              protected authService : AuthService,
              protected usersRepository : UsersRepository,
              protected securityService : SecurityService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request : Request = context.switchToHttp().getRequest();
    if(request.headers.authorization == 'Basic YWRtaW46cXdlcnR5'){
      return true
    }
    throw new UnauthorizedException(401)
    return false;
  }
  async checkForExistingUser(req: Request, res: Response){
    if (!req.headers.authorization) {
      throw new UnauthorizedException(401);
      return false;
    } else {
      const token : string = req.headers.authorization.split(" ")[1]
      const user = await this.jwtService.getUserByIdToken(token)
      if (user) {
        return true
      } else {
        throw new UnauthorizedException(401)
        return false;
      }
    }
  }
  async checkForUser(req: Request, res: Response){
    const token : string = req.headers.authorization!.split(" ")[1]
    const userId = await this.jwtService.getUserByIdToken(token)
    const comment = await this.commentsService.getCommentByIdWithUser(req.params.id, userId)
    if (!comment) {
      throw new UnauthorizedException(404)
      return false;
    }
    else if (comment.commentatorInfo.userId === userId) {
      return true;
    } else {
      throw new UnauthorizedException(403)
      return false;
    }
  }
  async checkForRefreshToken (req: Request, res: Response) {

    //CHECK FOR EXISTING REFRESH TOKEN
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      throw new UnauthorizedException(401)
      return false
    }


    //CHECK FOR NOT BLOCKED REFRESH TOKEN
    const isTokenBlocked: boolean = await this.authRepository.checkRefreshToken(refreshToken)
    if (isTokenBlocked) {
      throw new UnauthorizedException(401)
      return false
    }

    //CHECK FOR EXISTING SESSION WITH THIS REFRESH TOKEN

    const tokenList = await this.jwtService.getIdByRefreshToken(refreshToken)
    if (!tokenList) {
      throw new UnauthorizedException(401)
      return false
    }
    const session: RefreshTokensMeta | null = await this.securityRepository.findSessionByDeviceId(tokenList.deviceId)
    if (!session) {
      throw new UnauthorizedException(401)
      return false
    }
    const userId = await this.jwtService.getIdByRefreshToken(refreshToken)
    if (!userId) {
      throw new UnauthorizedException(401)
      return false
    }
    return true
  }
  async checkForSameDevice (req: Request, res: Response){
    const title : string = req.headers["user-agent"] || "unknown";
    const user : UserModel | null = await this.authService.authFindUser(req.body.loginOrEmail);
    if (!user) {
      throw new UnauthorizedException(401)
      return false
    }
    const userId : string = user.id;
    const status : boolean = await this.securityService.checkForSameDevice(title, userId);
    if (!status) {
      throw new UnauthorizedException(403)
      return false
    }
    return true
  }
  async checkForSameUser (req: Request, res: Response){
    const refreshToken : string = req.cookies.refreshToken;
    const id : string = req.params.id;
    const userInfo = await this.jwtService.getIdByRefreshToken(refreshToken)
    const session = await this.securityRepository.findSessionByDeviceId(id)
    if(!session) {
      throw new UnauthorizedException(404)
      return false
    }
    if (!userInfo) {
      throw new UnauthorizedException(401)
      return false
    }
    if (session.userId !== userInfo.userId) {
      throw new UnauthorizedException(403)
      return false
    }
    return true
  }
  async checkForDeviceId (req: Request, res: Response){
    const deviceId : string = req.params.id;
    const session : RefreshTokensMeta | null = await this.securityRepository.findSessionByDeviceId(deviceId);
    if (!session) {
      throw new UnauthorizedException(404)
      return false
    }
    return true
  }
  async checkForExistingEmail (req : Request, res : Response){
    const User = await this.usersRepository.returnUserByEmail(req.body.email)
    if (!User) {
      throw new UnauthorizedException(204)
      return false
    }
    return true
  }
  async checkForNotSamePassword (req: Request, res: Response){
    const status : boolean = await this.authRepository.recoveryRequest(req.body.recoveryCode, req.body.newPassword)
    if (status) {
      throw new UnauthorizedException(401)
      return false
    }
    return true
  }
}