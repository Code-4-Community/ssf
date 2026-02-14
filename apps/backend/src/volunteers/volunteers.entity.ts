import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Pantry } from '../pantries/pantries.entity';

@Entity()
export class Volunteer {
  @PrimaryGeneratedColumn({ name: 'volunteer_id' })
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  phone: string;

  @ManyToMany(() => Pantry, (pantry) => pantry.volunteers)
  @JoinTable({
    name: 'volunteer_assignments',
    joinColumn: {
      name: 'volunteer_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'pantry_id',
      referencedColumnName: 'pantryId',
    },
  })
  pantries?: Pantry[];
}
