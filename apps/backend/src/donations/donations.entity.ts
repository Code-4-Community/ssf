import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { DonationStatus, RecourranceEnum } from './types';

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
    enum: DonationStatus,
    enumName: 'donations_status_enum',
    default: DonationStatus.AVAILABLE,
  })
  status: DonationStatus;

  @Column({ name: 'total_items', type: 'int', nullable: true })
  totalItems: number;

  @Column({ name: 'total_oz', type: 'int', nullable: true })
  totalOz: number;

  @Column({ name: 'total_estimated_value', type: 'int', nullable: true })
  totalEstimatedValue: number;

  @Column({
    name: 'recurrance',
    type: 'enum',
    enum: RecourranceEnum,
    enumName: 'donation_recurrance_enum',
    default: RecourranceEnum.ONCE,
  })
  recurrance: RecourranceEnum;

  @Column({ name: 'recurrance_value', type: 'int', nullable: true })
  recurranceValue: number;

  @Column({
    name: 'next_donation_dates',
    type: 'timestamptz',
    array: true,
    nullable: true,
  })
  nextDonationDates: Date[];

  @Column({ name: 'occurances', type: 'int', nullable: true })
  occurances: number;
}
