import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { Status } from './types';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: Status.STANDARD,
  })
  status: Status;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;
}
