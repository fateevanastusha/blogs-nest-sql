import { Length } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class LikesDto {
  @Length(4, 7)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  likeStatus : 'Like' | 'Dislike' | 'None'
}