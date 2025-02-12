import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn({ name: 'donation_id' })
  donationId: number;

  @OneToOne(() => FoodManufacturer, { nullable: false })
  @JoinColumn({ name: 'food_manufacturer_id' })
  foodManufacturer: FoodManufacturer;

  @Column({ name: 'food_manufacturer_id', type: 'int' })
  foodManufacturerId: number;

  @CreateDateColumn({
    name: 'date_donated',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  dateDonated: Date;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 25,
    default: 'in progress',
  })
  status: string;

  @Column({ name: 'total_items', type: 'int', nullable: true })
  totalItems: number;

  @Column({ name: 'total_oz', type: 'int', nullable: true })
  totalOz: number;

  @Column({ name: 'total_estimated_value', type: 'int', nullable: true })
  totalEstimatedValue: number;
}
