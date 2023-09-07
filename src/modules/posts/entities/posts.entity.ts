import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogsEntity } from '../../blogs/entities/blogs.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { LikesEntity } from '../../likes/entities/likes.entity';

@Entity({ name: 'Posts' })
export class PostsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BlogsEntity, (u) => u.posts)
  @JoinColumn({ name: 'blogId' })
  blogId: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar' })
  blogName: string;

  @OneToMany(() => CommentsEntity, (b) => b.postId)
  comments: CommentsEntity[];

  @OneToMany(() => LikesEntity, (b) => b.postId)
  likes: LikesEntity[];
}
