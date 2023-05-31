import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import { BloggersController } from "./api/blogger/bloggers/bloggers.controller";
import { BloggersRepository } from "./api/blogger/bloggers/bloggers.repository";
import { BloggersService } from "./api/blogger/bloggers/bloggers.service";
import { QueryRepository } from "./helpers/query.repository";
import { MongoModule } from "./db/mongo.module";
import { PostsService } from "./api/public/posts/posts.service";
import { PostsRepository } from "./api/public/posts/posts.repository";
import { UsersService } from "./api/superadmin/users/users.service";
import { UsersRepository } from "./api/superadmin/users/users.repository";
import { PostsController } from "./api/public/posts/posts.controller";
import { UsersController } from "./api/superadmin/users/users.controller";
import { PostSchema } from "./api/public/posts/posts.schema";
import { UserSchema } from "./api/superadmin/users/users.schema";
import { CommentSchema } from "./api/public/comments/comments.schema";
import { LikeSchema } from "./likes/likes.schema";
import { CommentsController } from "./api/public/comments/comments.controller";
import { SecurityRepository } from "./api/public/security/security.repository";
import { RefreshTokensBlocked, RefreshTokensMetaSchema } from "./api/public/security/security.schema";
import { AttemptsSchema } from "./attempts/attempts.schema";
import { AttemptsRepository } from "./attempts/attempts.repository";
import { AuthRepository } from "./api/public/auth/auth.repository";
import { AuthController } from "./api/public/auth/auth.controller";
import { CommentsService } from "./api/public/comments/comments.service";
import { CommentsRepository } from "./api/public/comments/comments.repository";
import { LikesRepository } from "./likes/likes.repository";
import { SecurityService } from "./api/public/security/security.service";
import { LikesHelpers } from "./helpers/likes.helper";
import { JwtService } from "./jwt.service";
import { AuthService } from "./api/public/auth/auth.service";
import { AuthGuard } from "./auth.guard";
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from "./api/public/auth/strategies/passport.strategy";
import { BusinessService } from "./business.service";
import { IsUserAlreadyExistConstraint } from "./api/superadmin/users/users.dto";
import { SecurityController } from "./api/public/security/security.controller";
import { BlogSchema } from "./api/public/blogs/blogs.schema";
import { BlogsController } from "./api/public/blogs/blogs.controller";
import { BlogsSuperAdminController } from "./api/superadmin/blogs/blogs.super.admin.controller";
import { BlogsSuperAdminRepository } from "./api/superadmin/blogs/blogs.super.admin.repository";
import { BlogsRepository } from "./api/public/blogs/blogs.repository";
import { BlogsService } from "./api/public/blogs/blogs.service";
import { BlogsSuperAdminService } from "./api/superadmin/blogs/blogs.super.admin.service";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateUserUseCase } from "./api/use-cases/users/users-create-user-use-case";
import { DeleteUserUseCase } from "./api/use-cases/users/users-delete-user-use-case";

const repositories = [
  UsersRepository,
  SecurityRepository,
  PostsRepository,
  LikesRepository,
  CommentsRepository,
  AuthRepository,
  AttemptsRepository,
  BloggersRepository,
  BlogsRepository,
  BlogsSuperAdminRepository,
]
const services = [
  UsersService,
  SecurityService,
  PostsService,
  CommentsService,
  BloggersService,
  BlogsService,
  BlogsSuperAdminService,
  AuthService,
  BusinessService,
  AppService,
  JwtService
]

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase
]

@Module({
  imports: [
    CqrsModule,
     PassportModule,
     MongoModule,
     MongooseModule.forFeature([{
        name : "bloggers",
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
    BloggersController,
    BlogsController,
    BlogsSuperAdminController,
    PostsController,
    UsersController,
    CommentsController,
    AppController,
    AuthController,
    SecurityController],
  providers: [IsUserAlreadyExistConstraint,
    ...repositories,
    ...services,
    ...useCases,
    QueryRepository,
    LikesHelpers,
    AuthGuard,
    LocalStrategy,
    ],
})
export class AppModule {}
