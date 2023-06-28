import { Schema } from "@nestjs/mongoose";
import { IsBoolean, IsNumber, IsString, Length } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

@Schema()
export class BanUserForBlogDto {
  @IsBoolean()
  isBanned : boolean
  @Length(20, 1000)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  banReason : string
  @IsNumber()
  blogId : number
}
