import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DonationStatus } from './types';

@Entity()
export class Donation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', array: true }) //FIX
  restrictions: string[];

  @Column({ type: 'timestamp' })
  due_date: Date;

  @Column({ type: 'int' })
  pantry_id: number;

  //@Column({ type: 'varchar', length: 50 })
  @Column({ type: 'enum', enum: DonationStatus })
  status: string;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'json' })
  contents: JSON;
}
