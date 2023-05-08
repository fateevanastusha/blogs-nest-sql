import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Observable } from 'rxjs';
import { Request } from "express";
import { UsersService } from "./users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(protected usersService : UsersService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request : Request = context.switchToHttp().getRequest();
    console.log(request.headers.authorization == 'Basic YWRtaW46cXdlcnR5')
    if(request.headers.authorization == 'Basic YWRtaW46cXdlcnR5'){
      return true
    }
    throw new UnauthorizedException(401)
    return false;
  }
}