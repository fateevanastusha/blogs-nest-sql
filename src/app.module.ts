import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersController } from './modules/blogs/controller/bloggers.controller';
import { QueryRepository } from './utils/query.repository';
import { MongoModule } from './db/mongo.module';
import { PostsRepository } from './modules/posts/repository/posts.repository';
import { UsersService } from './modules/users/domain/users.service';
import { UsersRepository } from './modules/users/repository/users.repository';
import { PostsController } from './modules/posts/controller/posts.controller';
import { UsersController } from './modules/users/controller/users.controller';
import { PostSchema } from './modules/posts/schemas/posts.schema';
import { UserSchema } from './modules/users/schemas/users.schema';
import { CommentSchema } from './modules/comments/schemas/comments.schema';
import { LikeSchema } from './modules/likes/schemas/likes.schema';
import { CommentsController } from './modules/comments/controller/comments.controller';
import { SecurityRepository } from './modules/security/repository/security.repository';
import {
  RefreshTokensBlocked,
  RefreshTokensMetaSchema,
} from './modules/security/schemas/security.schema';
import { AuthRepository } from './modules/auth/auth.repository';
import { AuthController } from './modules/auth/auth.controller';
import { CommentsRepository } from './modules/comments/repository/comments.repository';
import { LikesRepository } from './modules/likes/repository/likes.repository';
import { SecurityService } from './modules/security/domain/security.service';
import { JwtService } from './utils/jwt.service';
import { AuthService } from './modules/auth/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './modules/auth/strategies/passport.strategy';
import { BusinessService } from './mail/business.service';
import { IsUserAlreadyExistConstraint } from './modules/users/dto/users.dto';
import { SecurityController } from './modules/security/controller/security.controller';
import { BlogSchema } from './modules/blogs/schemas/blogs.schema';
import { BlogsController } from './modules/blogs/controller/blogs.controller';
import { BlogsSuperAdminController } from './modules/blogs/controller/blogs.super.admin.controller';
import { BlogsRepository } from './modules/blogs/repository/blogs.repository';
import { CreateUserUseCase } from './modules/users/use-cases/users-create-user-use-case';
import { DeleteUserUseCase } from './modules/users/use-cases/users-delete-user-use-case';
import { CreateBlogUseCase } from './modules/blogs/use-cases/blogs-create-blog-use-case';
import { CreatePostUseCase } from './modules/posts/use-cases/posts-create-post-use-case';
import { DeletePostUseCase } from './modules/posts/use-cases/posts-delete-post-use-case';
import { DeleteBlogUseCase } from './modules/blogs/use-cases/blogs-delete-blog-use-case';
import { CreateCommentUseCase } from './modules/comments/use-cases/comments-create-comment-use-case';
import { BloggersUsersService } from './modules/users/domain/bloggers.users.service';
import { BloggersUsersController } from './modules/users/controller/bloggers.users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { BannedUsersRepository } from './modules/users/repository/bloggers.banned.users.repository';
import { DeleteCommentUseCase } from './modules/comments/use-cases/comments-delete-comment-use-case';
import { UpdateCommentUseCase } from './modules/comments/use-cases/comments-update-comment-use-case';
import { GetCommentWithUserUseCase } from './modules/comments/use-cases/comments-get-comment-with-user-use-case';
import { GetCommentUseCase } from './modules/comments/use-cases/comments-get-comment-use-case';
import { LikeCommentUseCase } from './modules/comments/use-cases/comments-like-comment-use-case';
import { UpdateBlogUseCase } from './modules/blogs/use-cases/blogs-update-blog-use-case';
import { GetBlogUseCase } from './modules/blogs/use-cases/blogs-get-blog-use-case';
import { UpdatePostUseCase } from './modules/posts/use-cases/posts-update-post-use-case';
import { UserEntity } from './modules/users/entities/user.entity';
import { BlogsEntity } from './modules/blogs/entities/blogs.entity';
import { PostsEntity } from './modules/posts/entities/posts.entity';
import { CommentsEntity } from './modules/comments/entities/comments.entity';
import { LikesEntity } from './modules/likes/entities/likes.entity';
import { BannedForBlogUsersEntity } from './modules/blogs/entities/banned.for.blog.users.entity';
import { BlockedTokensEntity } from './modules/security/entities/blocked.tokens.entity';
import { RefreshTokensEntity } from './modules/security/entities/refresh.tokens.entity';
import { GetPostUseCase } from './modules/posts/use-cases/posts-get-post-use-case';
import { GetCommentsByBlogUseCase } from './modules/comments/use-cases/comments-get-comments-by-blog-use-case';
import { GetBlogsByOwnerUseCase } from './modules/blogs/use-cases/blogs-get-blogs-by-owner-use-case';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { GetBlogsUseCase } from './modules/blogs/use-cases/blogs-get-blogs-use-case';
import { GetBlogsSaUseCase } from './modules/blogs/use-cases/blogs-get-blogs-sa-use-case';
import { BanBlogUseCase } from './modules/blogs/use-cases/blogs-ban-blog-use-case';
import { BindBlogUseCase } from './modules/blogs/use-cases/blogs-bind-blog-use-case';
import { GetPostsUseCase } from './modules/posts/use-cases/posts-get-posts-use-case';
import { ChangePostLikeStatusUseCase } from './modules/posts/use-cases/posts-change-like-status-use-case';
import { GetPostsByBlogIdUseCase } from './modules/posts/use-cases/posts-get-posts-by-blog-id-use-case';
import { GetPostsWithUserUseCase } from './modules/posts/use-cases/posts-get-posts-with-user-use-case';
import { GetCommentsByPostUseCase } from './modules/comments/use-cases/comments-get-comments-by-post-use-case';
import { APP_GUARD } from '@nestjs/core';

const repositories = [
  UsersRepository,
  SecurityRepository,
  PostsRepository,
  LikesRepository,
  CommentsRepository,
  AuthRepository,
  BlogsRepository,
  BannedUsersRepository,
];
const services = [
  UsersService,
  BloggersUsersService,
  SecurityService,
  AuthService,
  BusinessService,
  JwtService,
];

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  BanBlogUseCase,
  BindBlogUseCase,
  GetBlogUseCase,
  GetBlogsUseCase,
  GetBlogsSaUseCase,
  GetBlogsByOwnerUseCase,
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
  GetPostUseCase,
  GetPostsUseCase,
  ChangePostLikeStatusUseCase,
  GetPostsByBlogIdUseCase,
  GetPostsWithUserUseCase,
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  GetCommentUseCase,
  GetCommentWithUserUseCase,
  GetCommentsByBlogUseCase,
  GetCommentsByPostUseCase,
  LikeCommentUseCase,
];

const entities = [
  UserEntity,
  BlogsEntity,
  PostsEntity,
  CommentsEntity,
  LikesEntity,
  BannedForBlogUsersEntity,
  BlockedTokensEntity,
  RefreshTokensEntity,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forRoot({
      url:
        process.env.POSTGRES_CONNECTION_STRING ||
        'postgres://fateevanastusha:qzMDJ0ZXEam4@ep-still-star-556812.eu-central-1.aws.neon.tech/blogsapi',
      type: 'postgres' as const,
      autoLoadEntities: false,
      entities,
      synchronize: false,
      ssl: { rejectUnauthorized: false },
    }),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    TypeOrmModule.forFeature(entities),
    PassportModule,
    MongoModule,
    MongooseModule.forFeature([
      {
        name: 'bloggers',
        schema: BlogSchema,
      },
      {
        name: 'posts',
        schema: PostSchema,
      },
      {
        name: 'users',
        schema: UserSchema,
      },
      {
        name: 'comments',
        schema: CommentSchema,
      },
      {
        name: 'likes',
        schema: LikeSchema,
      },
      {
        name: 'comments',
        schema: CommentSchema,
      },
      {
        name: 'refresh token meta',
        schema: RefreshTokensMetaSchema,
      },
      {
        name: 'refresh token blocked',
        schema: RefreshTokensBlocked,
      },
    ]),
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
    SecurityController,
    BloggersUsersController,
  ],
  providers: [
    /*{
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },*/
    IsUserAlreadyExistConstraint,
    ...repositories,
    ...services,
    ...useCases,
    QueryRepository,
    AuthGuard,
    LocalStrategy,
  ],
})
export class AppModule {}
