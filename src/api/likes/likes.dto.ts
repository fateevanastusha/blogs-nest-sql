import { IsEnum, Length } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

enum LikeStatusesEnum {
  Like = "Like",
  Dislike = "Dislike",
  None = "None"
}

export class LikesDto {
  @IsEnum(LikeStatusesEnum)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  likeStatus: string
}