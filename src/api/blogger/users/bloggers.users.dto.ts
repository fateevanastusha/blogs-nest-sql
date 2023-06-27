import { Schema } from "@nestjs/mongoose";
import { IsBoolean, IsString, Length } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

@Schema()
export class BanUserForBlogDto {
  @IsBoolean()
  isBanned : boolean
  @Length(20, 1000)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  banReason : string
  @IsString()
  @Length(5, 1000)
  blogId : number
}
