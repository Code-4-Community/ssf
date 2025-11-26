import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Pantry } from '../pantries/pantries.entity';

@Entity('volunteer_assignments')
export class VolunteerAssignment {
  @PrimaryColumn({ name: 'volunteer_id' })
  volunteerId: number;

  @PrimaryColumn({ name: 'pantry_id' })
  pantryId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'volunteer_id',
    referencedColumnName: 'id',
  })
  volunteer: User;

  @ManyToOne(() => Pantry, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'pantry_id',
    referencedColumnName: 'pantryId',
  })
  pantry: Pantry;
}
