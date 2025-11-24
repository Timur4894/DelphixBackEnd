import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_ticker', referencedColumnName: 'ticker' })
  company: Company;

  @Column({ length: 20 })
  company_ticker: string;

  @Column({ length: 10 })
  type: 'BUY' | 'SELL';

  @Column('float')
  quantity: number;

  @Column('float')
  price_per_share: number;

  @Column('float')
  total_cost: number;

  @Column()
  date: Date;

  @Column('text', { nullable: true })
  notes?: string;
}

