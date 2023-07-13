import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { BannedForBlogUsersEntity } from './banned.for.blog.users.entity';

@Entity({name: 'Blogs'})
export class BlogsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, u => u.blogs)
  @JoinColumn({name: 'userId'})
  userId: number

  @Column({ type: 'varchar'})
  userLogin: string;

  @Column({ type: 'varchar'})
  name: string;

  @Column({ type: 'varchar'})
  description: string;

  @Column({ type: 'varchar'})
  websiteUrl: string;

  @Column({ type: 'varchar'})
  createdAt: string;

  @Column({ type: 'boolean', default: false})
  isMembership: boolean;

  @Column({ type: 'boolean', default: false})
  isBanned: boolean;

  @Column({ type: 'varchar', nullable: true})
  banDate: string | null

  @OneToMany(() => PostsEntity, p => p.blogId, )
  posts: PostsEntity[]

  @OneToMany(() => CommentsEntity, b => b.blogId, )
  comments: CommentsEntity[]

  @OneToMany(() => BannedForBlogUsersEntity, b => b.blogId, )
  bannedForBlogUsers: BannedForBlogUsersEntity[]
}