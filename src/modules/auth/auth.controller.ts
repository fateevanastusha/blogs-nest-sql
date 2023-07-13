import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
  Body,
  HttpCode,
  BadRequestException, UnauthorizedException
} from "@nestjs/common";
import { CheckForRefreshToken } from "../../guards/auth.guard";
import { AuthService } from "./auth.service";
import { AccessToken, TokenList } from "../security/schemas/security.schema";
import { UserModel } from "../users/schemas/users.schema";
import { UsersDto } from "../users/dto/users.dto";
import { EmailDto } from "./auth.dto";
import { CreateUserUsersCommand } from "../users/use-cases/users-create-user-use-case";
import { CommandBus } from "@nestjs/cqrs";

@Controller('auth')
export class AuthController {
  constructor(protected authService : AuthService,
              protected commandBus : CommandBus){}
  @HttpCode(200)
  @Post('/login')
  async loginRequest(@Req() req: any, @Res() res: any){
    const title = req.headers["user-agent"] || "unknown"
    const tokenList: TokenList | null = await this.authService.authRequest(req.body.password, req.ip, req.body.loginOrEmail, title)
    if (tokenList) {
      let token: AccessToken = {
        accessToken: tokenList.accessToken
      }
      res.cookie('refreshToken', tokenList.refreshToken, {httpOnly: true, secure: true})
      res.send(token)
      return
    } throw new UnauthorizedException()

  }

  @Post('/password-recovery')
  async passwordRecoveryRequest(@Req() req: any){
    const status : boolean = await this.authService.passwordRecovery(req.body.email)
    if (status) return
    else {
      throw new BadRequestException();
    }
  }
  @HttpCode(204)
  @Post('/new-password')
  async newRecoveryRequest(@Req() req: any){
    const status : boolean = await this.authService.changePasswordWithCode(req.body.recoveryCode, req.body.newPassword)
    if(status) {
      return
    } else {
      throw new BadRequestException()
      return
    }
  }
  @HttpCode(204)
  @Post('/registration')
  async registrationRequest(@Body() user: UsersDto){
    return await this.commandBus.execute(
      new CreateUserUsersCommand(user)
    )
  }
  @HttpCode(204)
  @Post('/registration-confirmation')
  async confirmationRequest(@Req() req: any){
    const status = await this.authService.checkForConfirmationCode(req.body.code)
    if (!status) {
      throw new BadRequestException({ message : ['code is wrong'] })
    } else {
      return
    }
  }
  @HttpCode(204)
  @Post('/registration-email-resending')
  async emailResendingRequest(@Body() body : EmailDto){
    const status: boolean = await this.authService.emailResending(body.email)
    if (status) {
      return
    } else {
      throw new BadRequestException()
    }
  }
  @HttpCode(204)
  @UseGuards(CheckForRefreshToken)
  @Post('/logout')
  async logoutRequest(@Req() req: any){
    const status : boolean = await this.authService.logoutRequest(req.cookies.refreshToken)
    if (!status) throw new UnauthorizedException()
    return
  }
  @HttpCode(200)
  @UseGuards(CheckForRefreshToken)
  @Post('/refresh-token')
  async refreshTokenRequest(@Req() req: any,
                            @Res() res: any){
    const title = req.headers["user-agent"] || "unknown"
    const tokenList: TokenList = await this.authService.createNewToken(req.cookies.refreshToken, req.ip, title)
    let token: AccessToken = { accessToken: tokenList.accessToken }
    res.cookie('refreshToken', tokenList.refreshToken, {httpOnly: true, secure: true})
    res.send(token)
  }
  @Get('/me')
  async getInformation(@Req() req: any){
    const auth = req.headers.authorization
    if (!auth) throw new UnauthorizedException()

    const [authType, token] = auth.split(' ')
    if (authType !== 'Bearer') throw new UnauthorizedException()

    const user: UserModel | null = await this.authService.getInformationAboutCurrentUser(token)
    if (user) {
      const currentUser = {
        email: user.email,
        login : user.login,
        userId : user.id + ''
      }
      return currentUser
    } else {
      throw new UnauthorizedException()

    }
  }
}
