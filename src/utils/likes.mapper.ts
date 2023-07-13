import { LikeModel } from "../modules/likes/schemas/likes.schema";
import { Injectable } from "@nestjs/common";
@Injectable()
export class LikesHelpers {
  async requestType(status: LikeModel | null): Promise<string> {
    if (!status) {
      return "None"
    }
    return status.status
  }
}