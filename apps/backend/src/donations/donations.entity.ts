import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { DonationStatus, RecurrenceEnum } from './types';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';

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

  @Column({ name: 'total_oz', type: 'numeric', nullable: true })
  totalOz?: number | null;

  @Column({ name: 'total_estimated_value', type: 'numeric', nullable: true })
  totalEstimatedValue?: number | null;

  @Column({
    name: 'recurrence',
    type: 'enum',
    enum: RecurrenceEnum,
    enumName: 'donation_recurrence_enum',
    default: RecurrenceEnum.NONE,
  })
  recurrence!: RecurrenceEnum;

  @Column({ name: 'recurrence_freq', type: 'int', nullable: true })
  recurrenceFreq?: number | null;

  @Column({
    name: 'next_donation_dates',
    type: 'timestamptz',
    array: true,
    nullable: true,
  })
  nextDonationDates?: Date[] | null;

  @Column({ name: 'occurrences_remaining', type: 'int', nullable: true })
  occurrencesRemaining?: number | null;
}
