import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { DonationStatus } from './types';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn({ name: 'donation_id' })
  donationId!: number;

  @ManyToOne(() => FoodManufacturer, (manufacturer) => manufacturer.donations, {
    nullable: false,
  })
  @JoinColumn({ name: 'food_manufacturer_id' })
  foodManufacturer!: FoodManufacturer;

  @CreateDateColumn({
    name: 'date_donated',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  dateDonated!: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: DonationStatus,
    enumName: 'donations_status_enum',
    default: DonationStatus.AVAILABLE,
  })
  status!: DonationStatus;

  @Column({ name: 'total_items', type: 'int', nullable: true })
  totalItems?: number | null;

  @Column({ name: 'total_oz', type: 'int', nullable: true })
  totalOz?: number | null;

  @Column({ name: 'total_estimated_value', type: 'int', nullable: true })
  totalEstimatedValue?: number | null;
}
