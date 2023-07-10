import { Schema } from "@nestjs/mongoose";
import { Length } from "class-validator";

@Schema()
export class CommentsDto{
  @Length(20, 300)
  content : string
}