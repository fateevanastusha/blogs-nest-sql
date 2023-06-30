import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { PostsEntity } from './posts.entity';
import { CommentsEntity } from './comments.entity';

@Entity({name: 'Likes'})
export class LikesEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PostsEntity, u => u.likes)
  @JoinColumn({name: 'postId'})
  postId: number

  @ManyToOne(() => CommentsEntity, u => u.likes)
  @JoinColumn({name: 'commentId'})
  commentId: number

  @ManyToOne(() => UserEntity, u => u.likes)
  @JoinColumn({name: 'userId'})
  userId: number

  @Column({ type: 'varchar'})
  createdAt: string;

  @Column({ type: 'varchar'})
  status: string;
}