import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';

@Entity('news_items')
export class NewsItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_ticker', referencedColumnName: 'ticker' })
  company: Company;

  @Column({ length: 20 })
  company_ticker: string;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  summary: string;

  @Column({ length: 255, nullable: true })
  source?: string;

  @Column({ length: 500, nullable: true })
  url?: string;
}

  