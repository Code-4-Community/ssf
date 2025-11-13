import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Pantry } from '../pantries/pantries.entity';

@Entity('volunteer_assignments')
export class Assignments {
  @PrimaryGeneratedColumn({ name: 'assignment_id' })
  assignmentId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'volunteer_id',
    referencedColumnName: 'id',
  })
  volunteer: User;

  @OneToOne(() => Pantry, { nullable: true })
  @JoinColumn({
    name: 'pantry_id',
    referencedColumnName: 'pantryId',
  })
  pantry: Pantry;
}
