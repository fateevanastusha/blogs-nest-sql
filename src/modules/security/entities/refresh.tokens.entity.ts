import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'RefreshTokens' })
export class RefreshTokensEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  lastActiveDate: string;

  @Column({ type: 'varchar' })
  deviceId: string;

  @Column({ type: 'varchar' })
  ip: string;

  @ManyToOne(() => UserEntity, (u) => u.refreshTokens)
  @JoinColumn({ name: 'userId' })
  userId: number;
}
