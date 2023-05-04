import { BadRequestException, NotFoundException } from '@nestjs/common';
export enum ErrorCodes {
  Success,
  BadRequest,
  NotFound,
}

export const errorHandler = (code: ErrorCodes) => {
  switch (code) {
    case ErrorCodes.BadRequest: {
      throw new BadRequestException();
    }
    case ErrorCodes.NotFound: {
      throw new NotFoundException();
    }
  }
};