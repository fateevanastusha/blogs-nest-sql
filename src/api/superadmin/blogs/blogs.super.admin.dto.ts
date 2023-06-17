import { Schema } from "@nestjs/mongoose";
import { IsBoolean} from "class-validator";

@Schema()
export class BanBlogDto {
  @IsBoolean()
  isBanned : boolean
}