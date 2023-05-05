import { IsEmail, Length } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { Schema } from "@nestjs/mongoose";
@Schema()
export class UsersDto {
  @Length(3, 10)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  login: string
  @Length(6, 20)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  password: string;
  @Length(1, 1000)
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  email: string;
}
