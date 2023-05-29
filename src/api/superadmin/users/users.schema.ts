import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { IsOptional } from "class-validator";

export type UserDocument = HydratedDocument<UserModel>

@Schema()
export class UserBanInfo {
  @Prop({required : true})
  isBanned : boolean
  @Prop({required : true})
  banDate : string
  @Prop({required : true})
  banReason : string
}

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
  @Prop({required : true})
  banInfo : UserBanInfo
}

@Schema()
export class UserViewModel {
  @Prop({required : true})
  email : string
  @Prop({required: true})
  login : string
  @Prop({required: true})
  id : string
  @Prop({required : true})
  createdAt : string
  @Prop({required : true})
  banInfo : UserBanInfo
}

export const UserSchema = SchemaFactory.createForClass(UserModel)

