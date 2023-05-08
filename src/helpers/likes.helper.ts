import { LikeModel } from "../likes/likes.schema";
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