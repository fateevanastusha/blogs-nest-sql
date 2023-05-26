import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<UserModel>

@Schema()
export class UserModel {
  @Prop({required : true})
  email : string
  @Prop({required: true})
  login : string
  @Prop({required: true})
  password : string
  @Prop({required: true})
  id : string
  @Prop({required : true})
  createdAt : string
  @Prop({required : true})
  isConfirmed : boolean
  @Prop({required : true})
  confirmedCode : string
}

export const UserSchema = SchemaFactory.createForClass(UserModel)

