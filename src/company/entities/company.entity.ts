import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  ticker: string;

  @Column({ length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ length: 500, nullable: true })
  logo_url?: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
