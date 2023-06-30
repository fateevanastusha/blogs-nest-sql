import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'BlockedRefreshTokens'})
export class BlockedTokensEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar'})
  refreshToken: string;
}