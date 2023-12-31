import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Schema } from '@nestjs/mongoose';

export class BlogDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 15)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description: string;
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Length(1, 500)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  websiteUrl: string;
}

@Schema()
export class BanBlogDto {
  @IsBoolean()
  isBanned: boolean;
}

export class PostsBlogDto {
  @Length(1, 30)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;
  @Length(1, 100)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shortDescription: string;
  @Length(1, 1000)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  content: string;
}
