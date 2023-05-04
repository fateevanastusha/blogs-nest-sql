import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://admin:SUPERKEY@cluster0.leufa1s.mongodb.net/blogs-nest', {dbName: 'blogs-nest'}),
    // MongooseModule.forFeature([{
    //   name : "blogs",
    //   schema : BlogSchema
    // }
    // ])
  ],
  controllers: [],
  providers: [],
})
export class MongoModule {}