import { Prop, Schema } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RefreshTokensMetaDocument = HydratedDocument<RefreshTokensMeta>

@Schema()

export class AccessToken {
  @Prop({required : true})
  accessToken : string
}

@Schema()

export class RefreshToken {
  @Prop({required : true})
  refreshToken : string
}

@Schema()

export class TokenList {
  @Prop({required : true})
  accessToken : string
  @Prop({required : true})
  refreshToken : string
}

@Schema()

export class RefreshTokensMeta {
  @Prop({required : true})
  userId : string
  @Prop({required : true})
  ip: string
  @Prop({required : true})
  title: string
  @Prop({required : true})
  lastActiveDate: string
  @Prop({required : true})
  deviceId: string
}