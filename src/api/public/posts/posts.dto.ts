import { Length } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class PostsDto {
  @Length(1, 30)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string
  @Length(1, 100)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shortDescription: string;
  @Length(1, 1000)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  content: string;
  @Length(1, 20)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  blogId: number;
}

export class CommentsDto {
  @Length(20,300)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  content : string
}
