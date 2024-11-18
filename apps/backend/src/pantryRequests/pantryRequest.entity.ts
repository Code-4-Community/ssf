import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('pantry_requests')
export class PantryRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  address: string;

  @Column()
  approved: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pantry_representative_id' })
  pantry_representative_id: number;

  @Column({
    type: 'text',
    array: true,
  })
  restrictions: string[];
}
