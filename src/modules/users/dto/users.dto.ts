import {
  IsBoolean,
  IsEmail, IsNumber, IsString,
  Length, registerDecorator,
  ValidationArguments, ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { Schema } from "@nestjs/mongoose";
import { UsersRepository } from "../repository/users.repository";

@ValidatorConstraint({ async: true })
export class IsUserAlreadyExistConstraint implements ValidatorConstraintInterface {
  constructor(private userRepo: UsersRepository) {
  }
  async validate(loginOrEmail: string, args: ValidationArguments) {
    const user = await this.userRepo.returnUserByField(loginOrEmail)
    if (user) return false
    return true
  }
}

export function IsLoginOrEmailAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserAlreadyExistConstraint,
    });
  };
}

@Schema()
export class UsersDto {
  @Length(3, 10)
  @IsLoginOrEmailAlreadyExist({message: 'login already exists'})
  @Transform(({ value }: TransformFnParams) => value?.trim())
  login: string
  @Length(6, 20)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  password: string;
  @Length(1, 1000)
  @IsEmail()
  @IsLoginOrEmailAlreadyExist({message: 'email already exists'})
  @Transform(({ value }: TransformFnParams) => value?.trim())
  email: string;
}

@Schema()
export class BanUserDto {
  @IsBoolean()
  isBanned : boolean
  @Length(20, 1000)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  banReason : string
}


@Schema()
export class BanUserForBlogDto {
  @IsBoolean()
  isBanned : boolean
  @Length(20, 1000)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  banReason : string
  @IsString()
  blogId : string
}

