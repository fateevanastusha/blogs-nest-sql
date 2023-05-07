import { IsUrl, Length } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class BlogDto {
  @Length(1, 15)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;
  @Length(1, 500)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description: string;
  @IsUrl()
  @Length(1, 500)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  websiteUrl: string;
}