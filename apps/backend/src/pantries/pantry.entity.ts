import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Pantry {
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
  @JoinColumn({ name: 'ssf_representative_id' })
  ssfRepresentative: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pantry_representative_id' })
  pantryRepresentative: User;

  @Column('text', { array: true })
  restrictions: string[];
}
