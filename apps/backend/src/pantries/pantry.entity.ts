import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pantries')
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

  @Column()
  ssf_representative_id: number;

  @Column()
  pantry_representative_id: number;

  @Column({
    type: 'text',
    array: true,
  })
  restrictions: string[];
}
