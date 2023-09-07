import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogsEntity } from './blogs.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'BannedForBlogUser' })
export class BannedForBlogUsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BlogsEntity, (u) => u.bannedForBlogUsers)
  @JoinColumn({ name: 'blogId' })
  blogId: number;

  @ManyToOne(() => UserEntity, (u) => u.bannedForBlogUsers)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @Column({ type: 'varchar' })
  userLogin: string;

  @Column({ type: 'varchar' })
  banDate: string;

  @Column({ type: 'varchar' })
  banReason: string;
}
