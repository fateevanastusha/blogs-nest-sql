import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { PostModel } from "../../public/posts/posts.schema";
import { UserModel } from "../../superadmin/users/users.schema";

export type BlogDocument = HydratedDocument<BlogModel>

@Schema()
export class BlogOwnerModel {
  @Prop({required : true})
  userId: string
  @Prop({required : true})
  userLogin: string
}


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
  @Prop({required: true})
  blogOwnerInfo: BlogOwnerModel
}

@Schema()
export class BlogViewModel {
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
  items : BlogModel[] | PostModel[] | UserModel[] | BlogViewModel[]

}

export const BlogSchema = SchemaFactory.createForClass(BlogModel)
