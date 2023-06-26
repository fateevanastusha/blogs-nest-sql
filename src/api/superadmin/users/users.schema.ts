import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<UserModel>

@Schema({
  _id : false
})
export class UserBanInfo {
  @Prop({required : true})
  isBanned : boolean
  @Prop({type : String})
  banDate : string
  @Prop({type : String})
  banReason : string
}

@Schema()
export class UserModelCreate {
  @Prop({required : true})
  email : string
  @Prop({required: true})
  login : string
  @Prop({required: true})
  password : string
  @Prop({required : true})
  createdAt : string
  @Prop({required : true})
  confirmedCode : string
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
  isBanned : boolean
  @Prop({type : String})
  banDate : string
  @Prop({type : String})
  banReason : string
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

