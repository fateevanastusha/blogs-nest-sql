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
import { CommentsController } from "./comments/comments.controller";
import { SecurityRepository } from "./security/security.repository";
import { RefreshTokensBlocked, RefreshTokensMetaSchema } from "./security/security.schema";
import { AttemptsSchema } from "./attempts/attempts.schema";
import { AttemptsRepository } from "./attempts/attempts.repository";
import { AuthRepository } from "./auth/auth.repository";
import { AuthController } from "./auth/auth.controller";
import { CommentsService } from "./comments/comments.service";
import { CommentsRepository } from "./comments/comments.repository";
import { LikesRepository } from "./likes/likes.repository";
import { SecurityService } from "./security/security.service";
import { LikesHelpers } from "./helpers/likes.helper";
import { JwtService } from "./jwt.service";
import { AuthService } from "./auth/auth.service";
import { AuthGuard } from "./auth.guard";
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from "./auth/strategies/passport.strategy";
import { BusinessService } from "./business.service";
import { IsUserAlreadyExistConstraint } from "./users/users.dto";
import { SecurityController } from "./security/security.controller";

const repositories = [
  UsersRepository,
  SecurityRepository,
  PostsRepository,
  LikesRepository,
  CommentsRepository,
  AuthRepository,
  AttemptsRepository,
  BlogsRepository
]
const services = [
  UsersService,
  SecurityService,
  PostsService,
  CommentsService,
  BlogsService,
  AuthService,
  BusinessService,
  AppService,
  JwtService
]

@Module({
  imports: [
     PassportModule,
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
       },
       {
         name : "comments",
         schema : CommentSchema
       },
       {
         name : "refresh token meta",
         schema : RefreshTokensMetaSchema
       },
       {
         name : "attempts",
         schema : AttemptsSchema
       },
       {
         name : 'refresh token blocked',
         schema : RefreshTokensBlocked
       }
     ])
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    AppController,
    AuthController,
    SecurityController],
  providers: [IsUserAlreadyExistConstraint,
    ...repositories,
    ...services,
    QueryRepository,
    LikesHelpers,
    AuthGuard,
    LocalStrategy,
    ],
})
export class AppModule {}
