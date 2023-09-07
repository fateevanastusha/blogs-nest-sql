import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Quiz Game Questions' })
export class QuizGameEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  body: string;

  @Column({ type: 'array', nullable: true })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'varchar', nullable: true })
  updatedAt: string;
}
