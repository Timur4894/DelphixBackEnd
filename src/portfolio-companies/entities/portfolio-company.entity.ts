import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

@Entity('portfolio_companies')
export class PortfolioCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'ticker', referencedColumnName: 'ticker' })
  company: Company;

  @Column({ length: 20 })
  ticker: string;

  @Column('float')
  shares: number;

  @Column('float')
  avg_price: number;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

  