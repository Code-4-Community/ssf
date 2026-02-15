import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Role } from './types';
import { Pantry } from '../pantries/pantries.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id!: number;

  @Column({
    type: 'enum',
    name: 'role',
    enum: Role,
    enumName: 'users_role_enum',
    default: Role.VOLUNTEER,
  })
  role!: Role;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  phone!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'user_cognito_sub',
    default: '',
  })
  userCognitoSub!: string;

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
  pantries?: Pantry[] | null;
}
