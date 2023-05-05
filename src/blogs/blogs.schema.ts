import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { PostModel } from "../posts/posts.schema";
import { UserModel } from "../users/users.schema";

export type BlogDocument = HydratedDocument<BlogModel>

@Schema()
export class BlogModel {
  @Prop({required : true})
  name : string
  @Prop({required: true})
  description : string
  @Prop({required: true})
  websiteUrl : string
  @Prop({required: true})
  id : string
  @Prop({required : true})
  createdAt : string
  @Prop({required: true})
  isMembership : boolean
}

@Schema()
export class PaginatedClass {
  @Prop({required : true})
  pagesCount : number

  @Prop({required : true})
  page : number

  @Prop({required : true})
  pageSize : number

  @Prop({required : true})
  totalCount : number

  @Prop({required : true})
  items : BlogModel[] | PostModel[] | UserModel[]

}

export const BlogSchema = SchemaFactory.createForClass(BlogModel)
