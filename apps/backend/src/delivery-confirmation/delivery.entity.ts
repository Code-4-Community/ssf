import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  deliveryDate: Date;

  @Column({ nullable: true })
  feedback: string;

  @Column('simple-array', { nullable: true })
  photoPaths: string[];
}
