import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CommentDocument = HydratedDocument<CommentModel>

@Schema()
export class CommentatorInfo {
  @Prop({required : true})
  userId: string
  @Prop({required : true})
  userLogin: string
}

@Schema()
export class LikesInfo {
  @Prop({required : true})
  likesCount: number
  @Prop({required : true})
  dislikesCount: number
  @Prop({required : true})
  myStatus: string
}


@Schema()
export class CommentModel {
  @Prop({required : true})
  id : string
  @Prop({required : true})
  content : string
  @Prop({required : true})
  commentatorInfo : CommentatorInfo
  @Prop({required : true})
  createdAt: string
  @Prop({required : true})
  postId : string
  @Prop({required : true})
  likesInfo: LikesInfo
}

export const CommentSchema = SchemaFactory.createForClass(CommentModel)
