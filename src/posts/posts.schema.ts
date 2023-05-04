import { Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type PostDocument = HydratedDocument<PostModel>

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
}

export const PostSchema = SchemaFactory.createForClass(PostModel)
