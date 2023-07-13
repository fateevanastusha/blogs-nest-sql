import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlogsEntity } from '../../blogs/entities/blogs.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { LikesEntity } from '../../likes/entities/likes.entity';
import { BannedForBlogUsersEntity } from '../../blogs/entities/banned.for.blog.users.entity';
import { RefreshTokensEntity } from '../../security/entities/refresh.tokens.entity';

@Entity({name: 'Users'})
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true, type: 'varchar'})
  email: string;

  @Column({unique: true, type: 'varchar'})
  login: string;

  @Column({ type: 'varchar'})
  password: string;

  @Column({ type: 'varchar'})
  createdAt: string;

  @Column({type: 'boolean', default: false})
  isConfirmed: boolean;

  @Column({ type: 'varchar', })
  confirmedCode: string;

  @Column({ type: 'boolean', default: false})
  isBanned: boolean;

  @Column({ type: 'varchar', nullable: true})
  banDate: string | null

  @Column({ type: 'varchar', nullable: true})
  banReason: string | null;

  @OneToMany(() => BlogsEntity, b => b.userId, )
  blogs: BlogsEntity[]

  @OneToMany(() => CommentsEntity, b => b.userId, )
  comments: CommentsEntity[]

  @OneToMany(() => LikesEntity, b => b.userId, )
  likes: LikesEntity[]

  @OneToMany(() => BannedForBlogUsersEntity, b => b.userId, )
  bannedForBlogUsers: BannedForBlogUsersEntity[]

  @OneToMany(() => RefreshTokensEntity, b => b.userId, )
  refreshTokens: RefreshTokensEntity[]

}