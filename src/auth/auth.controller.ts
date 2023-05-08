import { Controller, Get, Post } from "@nestjs/common";

@Controller('auth')
export class AuthController {
  @Post('/login')
  async loginRequest(){

  }
  @Get('/me')
  async getInformation(){

  }
  @Post('/password-recovery')
  async passwordRecoveryRequest(){

  }
  @Post('/new-password')
  async newRecoveryRequest(){

  }
  @Post('/registration')
  async registrationRequest(){

  }
  @Post('/registration-confirmation')
  async confirmationRequest(){

  }
  @Post('/registration-email-resending')
  async emailResendingRequest(){

  }
  @Post('/logout')
  async logoutRequest(){

  }
  @Post('/refresh-token')
  async refreshTokenRequest(){

  }
}
