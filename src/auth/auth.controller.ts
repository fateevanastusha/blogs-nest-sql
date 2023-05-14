import { Controller, Get, Post, Req, UseGuards, Res, Body, HttpCode } from "@nestjs/common";
import { CheckAttempts, CheckForRefreshToken, CheckForSameDevice } from "../auth.guard";
import { AuthService } from "./auth.service";
import { AccessToken, TokenList } from "../security/security.schema";
import { UserModel } from "../users/users.schema";
import { ErrorCodes, errorHandler } from "../helpers/errors";
import { UsersDto } from "../users/users.dto";
import { BlogDto } from "../blogs/blogs.dto";

@UseGuards(CheckAttempts)
@Controller('auth')
export class AuthController {
  constructor(protected authService : AuthService){}
  @HttpCode(200)
  @UseGuards(CheckForSameDevice)
  @Post('/login')
  async loginRequest(@Req() req: any, @Res() res: any){
    const title = req.headers["user-agent"] || "unknown"
    const tokenList: TokenList | null = await this.authService.authRequest(req.body.password, req.ip, req.body.loginOrEmail, title)
    if (tokenList) {
      let token: AccessToken = {
        accessToken: tokenList.accessToken
      }
      console.log(token);
      res.cookie('refreshToken', tokenList.refreshToken, {httpOnly: true, secure: true})
      res.send(token)
      return
    } else {
      errorHandler(ErrorCodes.NotAutorized)
      return
    }
  }

  @Get('/me')
  async getInformation(@Req() req: any){
    const auth = req.headers.authorization
    if (!auth) {
      errorHandler(ErrorCodes.NotAutorized)
      return
    }
    const [authType, token] = auth.split(' ')
    if (authType !== 'Bearer') {
      errorHandler(ErrorCodes.NotAutorized)
      return
    }
    const user: UserModel | null = await this.authService.getInformationAboutCurrentUser(token)
    if (user) {
      const currentUser = {
        email: user.email,
        login : user.login,
        userId : user.id
      }
      return currentUser
    } else {
      errorHandler(ErrorCodes.NotAutorized)
      return
    }
  }
  @Post('/password-recovery')
  async passwordRecoveryRequest(@Req() req: any){
    const status : boolean = await this.authService.passwordRecovery(req.body.email)
    if (status) {
      return
    } else {
      errorHandler(ErrorCodes.BadRequest)
      return
    }
  }
  @Post('/new-password')
  async newRecoveryRequest(@Req() req: any){
    const status : boolean = await this.authService.changePasswordWithCode(req.body.recoveryCode, req.body.newPassword)
    if(status) {
      return
    } else {
      errorHandler(ErrorCodes.BadRequest)
      return
    }
  }
  @HttpCode(204)
  @Post('/registration')
  async registrationRequest(@Body() user: UsersDto){
    const status: boolean = await this.authService.registrationUser(user);
    if (status) {
      return
    } else {
      errorHandler(ErrorCodes.NotFound)
      return
    }
  }
  @HttpCode(204)
  @Post('/registration-confirmation')
  async confirmationRequest(@Req() req: any){
    const status = await this.authService.checkForConfirmationCode(req.body.code)
    if (!status) {
      errorHandler(ErrorCodes.BadRequest)
      return
    } else {
      return
    }
  }
  @HttpCode(204)
  @Post('/registration-email-resending')
  async emailResendingRequest(@Body() email : string){
    const status: boolean = await this.authService.emailResending(email)
    if (status) {
      return
    } else {
      errorHandler(ErrorCodes.BadRequest)
      return
    }
  }
  @UseGuards(CheckForRefreshToken)
  @Post('/logout')
  async logoutRequest(@Req() req: any){
    const status : boolean = await this.authService.logoutRequest(req.cookies.refreshToken)
    if (status) {
      return
    } else {
      errorHandler(ErrorCodes.NotAutorized)
      return
    }
  }
  @UseGuards(CheckForRefreshToken)
  @Post('/refresh-token')
  async refreshTokenRequest(@Req() req: any, @Res() res: any){
    const title = req.headers["user-agent"] || "unknown"
    const tokenList: TokenList | null = await this.authService.createNewToken(req.cookies.refreshToken, req.ip, title)
    if (tokenList) {
      let token: AccessToken = {
        accessToken: tokenList.accessToken
      }
      res.cookie('refreshToken', tokenList.refreshToken, {httpOnly: true, secure: true})
      return token;
    } else {
      errorHandler(ErrorCodes.NotAutorized)
      return
    }
  }
}
