import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { Role } from './types';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: Role.STANDARD_VOLUNTEER,
  })
  role: Role;

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
}
