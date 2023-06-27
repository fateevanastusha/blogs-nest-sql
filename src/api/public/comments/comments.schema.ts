import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CommentDocument = HydratedDocument<CommentModel>

@Schema()
export class CommentatorInfo {
  @Prop({required : true})
  userId: number
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
export class PostInfo {
  @Prop({required : true})
  id: number
  @Prop({required : true})
  title: string
  @Prop({required : true})
  blogId: number
  @Prop({required : true})
  blogName: string
  @Prop({required : true})
  blogOwnerId : number
}

@Schema()
export class CommentModel {
  @Prop({required : true})
  id : number
  @Prop({required : true})
  content : string
  @Prop({required : true})
  userId: number
  @Prop({required : true})
  userLogin: string
  @Prop({required : true})
  createdAt: string
  @Prop({required : true})
  postId : number
  @Prop({required : true})
  title: string
  @Prop({required : true})
  blogId: number
  @Prop({required : true})
  blogName: string
  @Prop({required : true})
  blogOwnerId : number
}

@Schema()
export class CreateCommentModel {
  @Prop({required : true})
  content : string
  @Prop({required : true})
  userId: number
  @Prop({required : true})
  userLogin: string
  @Prop({required : true})
  createdAt: string
  @Prop({required : true})
  postId : number
  @Prop({required : true})
  title: string
  @Prop({required : true})
  blogId: number
  @Prop({required : true})
  blogName: string
  @Prop({required : true})
  blogOwnerId : number
}

@Schema()
export class CommentViewFullModel {
  @Prop({required : true})
  id : number
  @Prop({required : true})
  content : string
  @Prop({required : true})
  commentatorInfo : CommentatorInfo
  @Prop({required : true})
  createdAt: string
  @Prop({required : true})
  likesInfo : LikesInfo
}


@Schema()
export class CommentViewModel {
  @Prop({required : true})
  id : number
  @Prop({required : true})
  content : string
  @Prop({required : true})
  commentatorInfo : CommentatorInfo
  @Prop({required : true})
  createdAt: string
  @Prop({required : true})
  likesInfo : LikesInfo
}

@Schema()
export class PostInfoViewModel {
  @Prop({required : true})
  id: number
  @Prop({required : true})
  title: string
  @Prop({required : true})
  blogId: number
  @Prop({required : true})
  blogName: string
}

export class CommentForBloggerViewModel {
  @Prop({required : true})
  id : number
  @Prop({required : true})
  content : string
  @Prop({required : true})
  commentatorInfo : CommentatorInfo
  @Prop({required : true})
  createdAt: string
  @Prop({required : true})
  postInfo : PostInfoViewModel
}

export const CommentSchema = SchemaFactory.createForClass(CommentModel)
