import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import { BlogSchema } from "./blogs/blogs.schema";
import { BlogsController } from "./blogs/blogs.controller";
import { BlogsRepository } from "./blogs/blogs.repository";
import { BlogsService } from "./blogs/blogs.service";
import { QueryRepository } from "./helpers/query.repository";
import { MongoModule } from "./db/mongo.module";
import { PostsService } from "./posts/posts.service";
import { PostsRepository } from "./posts/posts.repository";
import { UsersService } from "./users/users.service";
import { UsersRepository } from "./users/users.repository";
import { PostsController } from "./posts/posts.controller";
import { UsersController } from "./users/users.controller";
import { PostSchema } from "./posts/posts.schema";
import { UserSchema } from "./users/users.schema";
import { CommentSchema } from "./comments/comments.schema";
import { LikeSchema } from "./likes/likes.schema";

@Module({
  imports: [
     MongoModule,
     MongooseModule.forFeature([{
        name : "blogs",
       schema : BlogSchema
     },
       {
         name : "posts",
         schema : PostSchema
       },
       {
         name : "users",
         schema : UserSchema
       },
       {
         name : "comments",
         schema : CommentSchema
       },
       {
         name : "likes",
         schema : LikeSchema
       }
     ])
  ],
  controllers: [AppController, BlogsController, PostsController, UsersController],
  providers: [AppService, BlogsRepository, BlogsService, QueryRepository, PostsService, PostsRepository, UsersService, UsersRepository],
})
export class AppModule {}
