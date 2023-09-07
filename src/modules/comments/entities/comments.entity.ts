import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogsEntity } from '../../blogs/entities/blogs.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { LikesEntity } from '../../likes/entities/likes.entity';

@Entity({ name: 'Comments' })
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BlogsEntity, (u) => u.comments)
  @JoinColumn({ name: 'blogId' })
  blogId: number;

  @Column({ type: 'integer' })
  blogOwnerId: number;

  @Column({ type: 'varchar' })
  blogName: string;

  @ManyToOne(() => PostsEntity, (u) => u.comments)
  @JoinColumn({ name: 'postId' })
  postId: number;

  @ManyToOne(() => UserEntity, (u) => u.comments)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @Column({ type: 'varchar' })
  userLogin: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @OneToMany(() => LikesEntity, (b) => b.commentId)
  likes: LikesEntity[];
}
