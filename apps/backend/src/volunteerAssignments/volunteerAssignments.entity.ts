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
import { VOLUNTEER_ROLES, VolunteerType } from './types';

@Entity('volunteer_assignments')
export class Assignments {
  @PrimaryGeneratedColumn({ name: 'assignment_id' })
  assignmentId: number;

  @Column({ name: 'volunteer_id' })
  volunteerId: number;

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

  @Column({
    type: 'enum',
    enum: VOLUNTEER_ROLES,
    default: 'standard_volunteer',
    name: 'volunteer_type',
  })
  volunteerType: VolunteerType;
}
