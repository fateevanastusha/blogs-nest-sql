import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common";
export enum ErrorCodes {
  Success,
  BadRequest,
  NotFound,
  NotAutorized
}

export const errorHandler = (code: ErrorCodes) => {
  switch (code) {
    case ErrorCodes.BadRequest: {
      throw new BadRequestException();
    }
    case ErrorCodes.NotFound: {
      throw new NotFoundException();
    }
    case ErrorCodes.NotAutorized : {
      throw new UnauthorizedException()
    }
  }
};