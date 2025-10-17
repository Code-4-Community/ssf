import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { DonationsStatus } from './types';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn({ name: 'donation_id' })
  donationId: number;

  @ManyToOne(() => FoodManufacturer, (manufacturer) => manufacturer.donations, {
    nullable: false,
  })
  @JoinColumn({ name: 'food_manufacturer_id' })
  foodManufacturer: FoodManufacturer;

  @CreateDateColumn({
    name: 'date_donated',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  dateDonated: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: DonationsStatus,
    enumName: 'donations_status_enum',
    default: DonationsStatus.AVAILABLE,
  })
  status: DonationsStatus;

  @Column({ name: 'total_items', type: 'int', nullable: true })
  totalItems: number;

  @Column({ name: 'total_oz', type: 'int', nullable: true })
  totalOz: number;

  @Column({ name: 'total_estimated_value', type: 'int', nullable: true })
  totalEstimatedValue: number;
}
