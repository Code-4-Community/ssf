import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { Role } from './types';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: Role.VOLUNTEER,
  })
  role: Role;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;
}
