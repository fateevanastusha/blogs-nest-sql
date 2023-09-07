import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LikeDocument = HydratedDocument<LikeModel>;

@Schema()
export class LikeModel {
  @Prop({ required: true })
  status: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  postOrCommentId: string;
  @Prop({ required: true })
  createdAt: string;
}

@Schema()
export class LikeViewModel {
  @Prop({ required: true })
  addedAt: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  login: string;
}

export const LikeSchema = SchemaFactory.createForClass(LikeModel);
