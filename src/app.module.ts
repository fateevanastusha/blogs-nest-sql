import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersController } from './api/blogs/bloggers.controller';
import { QueryRepository } from './helpers/query.repository';
import { MongoModule } from './db/mongo.module';
import { PostsService } from './api/posts/posts.service';
import { PostsRepository } from './api/posts/posts.repository';
import { UsersService } from './api/users/users.service';
import { UsersRepository } from './api/users/users.repository';
import { PostsController } from './api/posts/posts.controller';
import { UsersController } from './api/users/users.controller';
import { PostSchema } from './api/posts/posts.schema';
import { UserSchema } from './api/users/users.schema';
import { CommentSchema } from './api/comments/comments.schema';
import { LikeSchema } from './likes/likes.schema';
import { CommentsController } from './api/comments/comments.controller';
import { SecurityRepository } from './api/security/security.repository';
import { RefreshTokensBlocked, RefreshTokensMetaSchema } from './api/security/security.schema';
import { AuthRepository } from './api/auth/auth.repository';
import { AuthController } from './api/auth/auth.controller';
import { CommentsRepository } from './api/comments/comments.repository';
import { LikesRepository } from './likes/likes.repository';
import { SecurityService } from './api/security/security.service';
import { LikesHelpers } from './helpers/likes.helper';
import { JwtService } from './jwt.service';
import { AuthService } from './api/auth/auth.service';
import { AuthGuard } from './auth.guard';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './api/auth/strategies/passport.strategy';
import { BusinessService } from './business.service';
import { IsUserAlreadyExistConstraint } from './api/users/users.dto';
import { SecurityController } from './api/security/security.controller';
import { BlogSchema } from './api/blogs/blogs.schema';
import { BlogsController } from './api/blogs/blogs.controller';
import { BlogsSuperAdminController } from './api/blogs/blogs.super.admin.controller';
import { BlogsRepository } from './api/blogs/blogs.repository';
import { BlogsService } from './api/blogs/blogs.service';
import { BlogsSuperAdminService } from './api/blogs/blogs.super.admin.service';
import { CreateUserUseCase } from './api/use-cases/users/users-create-user-use-case';
import { DeleteUserUseCase } from './api/use-cases/users/users-delete-user-use-case';
import { CreateBlogUseCase } from './api/use-cases/blogs/blogs-create-blog-use-case';
import { CreatePostUseCase } from './api/use-cases/posts/posts-create-post-use-case';
import { DeletePostUseCase } from './api/use-cases/posts/posts-delete-post-use-case';
import { DeleteBlogUseCase } from './api/use-cases/blogs/blogs-delete-blog-use-case';
import { CreateCommentUseCase } from './api/use-cases/comments/comments-create-comment-use-case';
import { BloggersUsersService } from './api/blogs/bloggers.users.service';
import { BloggersUsersController } from './api/blogs/bloggers.users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestRepo } from './test.repo';
import { CqrsModule } from '@nestjs/cqrs';
import { BannedUsersRepository } from './api/users/bloggers.banned.users.repository';
import { DeleteCommentUseCase } from './api/use-cases/comments/comments-delete-comment-use-case';
import { UpdateCommentUseCase } from './api/use-cases/comments/comments-update-comment-use-case';
import { GetCommentWithUserUseCase } from './api/use-cases/comments/comments-get-comment-with-user-use-case';
import { GetCommentUseCase } from './api/use-cases/comments/comments-get-comment-use-case';
import { LikeCommentUseCase } from './api/use-cases/comments/comments-like-comment-use-case';
import { UpdateBlogUseCase } from './api/use-cases/blogs/blogs-update-blog-use-case';
import { GetBlogUseCase } from './api/use-cases/blogs/blogs-get-blog-use-case';
import { UpdatePostUseCase } from './api/use-cases/posts/posts-update-post-use-case';
import { UserEntity } from './entities/user.entity';
import { BlogsEntity } from './entities/blogs.entity';
import { PostsEntity } from './entities/posts.entity';
import { CommentsEntity } from './entities/comments.entity';
import { LikesEntity } from './entities/likes.entity';
import { BannedForBlogUsersEntity } from './entities/banned.for.blog.users.entity';
import { BlockedTokensEntity } from './entities/blocked.tokens.entity';
import { RefreshTokensEntity } from './entities/refresh.tokens.entity';
import { GetPostUseCase } from './api/use-cases/posts/posts-get-post-use-case';
import { GetCommentsByBlogUseCase } from './api/use-cases/comments/comments-get-comments-by-blog-use-case';
import { GetBlogsByOwnerUseCase } from './api/use-cases/blogs/blogs-get-blogs-by-owner-use-case';
import { ThrottlerModule } from '@nestjs/throttler';

const repositories = [
  UsersRepository,
  SecurityRepository,
  PostsRepository,
  LikesRepository,
  CommentsRepository,
  AuthRepository,
  BlogsRepository,
  TestRepo,
  BannedUsersRepository,
];
const services = [
  UsersService,
  BloggersUsersService,
  SecurityService,
  PostsService,
  BlogsService,
  BlogsSuperAdminService,
  AuthService,
  BusinessService,
  AppService,
  JwtService,
];

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  GetBlogUseCase,
  GetBlogsByOwnerUseCase,
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
  GetPostUseCase,
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  GetCommentUseCase,
  GetCommentWithUserUseCase,
  GetCommentsByBlogUseCase,
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
  RefreshTokensEntity
]

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forRoot({
      url: process.env.POSTGRES_CONNECTION_STRING || 'postgres://fateevanastusha:qzMDJ0ZXEam4@ep-still-star-556812.eu-central-1.aws.neon.tech/blogsapi',
      type: 'postgres' as const,
      autoLoadEntities: false,
      entities,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    TypeOrmModule.forFeature(entities),
    PassportModule,
    MongoModule,
    MongooseModule.forFeature([{
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
    BloggersUsersController],
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
