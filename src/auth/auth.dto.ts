import { Schema } from "@nestjs/mongoose";
import { IsEmail, Length } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";


@Schema()
export class EmailDto {
  @Length(1, 1000)
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  email: string;
}
