import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CheckAttempts, CheckForRefreshToken, CheckForSameDevice } from "../auth.guard";

@UseGuards(CheckAttempts)
@Controller('auth')
export class AuthController {
  @UseGuards(CheckForSameDevice)
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
  @UseGuards(CheckForRefreshToken)
  @Post('/logout')
  async logoutRequest(){

  }
  @UseGuards(CheckForRefreshToken)
  @Post('/refresh-token')
  async refreshTokenRequest(){

  }
}
