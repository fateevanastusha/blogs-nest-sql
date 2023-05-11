import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AttemptDocument = HydratedDocument<AttemptsModel>

@Schema()
export class AttemptsModel {
  @Prop({required : true})
  userIP: string
  @Prop({required : true})
  url: string
  @Prop({required : true})
  time: Date
}

export const AttemptsSchema = SchemaFactory.createForClass(AttemptsModel)
