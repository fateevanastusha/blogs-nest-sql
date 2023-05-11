import { AttemptsModel } from "./attempts.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

export class AttemptsRepository {
  constructor(@InjectModel('attempts') private attemptsModel : Model<AttemptsModel>) {}

  async addAttempts(attempt : AttemptsModel) {
    return this.attemptsModel.insertMany(attempt)
  }
  async countOfAttempts(userIP: string, url: string, timeLimit: Date) {
    return this.attemptsModel.countDocuments({userIP, url, time: {$gt: timeLimit}})
  }
}