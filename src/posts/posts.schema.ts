import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PostDocument = HydratedDocument<PostModel>

@Schema()
export class extendedLikesInfo {
  @Prop({required : true} )
  likesCount: number
  @Prop({required : true} )
  dislikesCount: number
  @Prop({required : true} )
  myStatus: string
  @Prop({required : true} )
  newestLikes: []
}

@Schema()
export class PostModel {
  @Prop({required : true})
  id: string
  @Prop({required : true})
  title: string
  @Prop({required : true})
  shortDescription: string
  @Prop({required : true})
  content: string
  @Prop({required : true})
  blogId: string
  @Prop({required : true})
  blogName: string
  @Prop({required : true})
  createdAt: string
  @Prop({required : true} )
  extendedLikesInfo: extendedLikesInfo
}


export const PostSchema = SchemaFactory.createForClass(PostModel)
