import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://admin:SUPERKEY@cluster0.leufa1s.mongodb.net/bloggers-nest', {dbName: 'bloggers-nest'}),
    // MongooseModule.forFeature([{
    //   name : "bloggers",
    //   schema : BlogSchema
    // }
    // ])
  ],
  controllers: [],
  providers: [],
})
export class MongoModule {}