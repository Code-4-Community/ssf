import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Donation } from '../donations/donations.entity';

@Entity('donation_items')
export class DonationItem {
  @PrimaryGeneratedColumn({ name: 'item_id' })
  itemId: number;

  @Column({ name: 'donation_id', type: 'int' })
  donationId: number;

  @ManyToOne(() => Donation, { nullable: false })
  @JoinColumn({ name: 'donation_id', referencedColumnName: 'donationId' })
  donation: Donation;

  @Column({ name: 'item_name', type: 'varchar', length: 255 })
  itemName: string;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ name: 'status', type: 'varchar', length: 25, default: 'avaliable' })
  status: string;

  @Column({ name: 'oz_per_item', type: 'int', nullable: true })
  ozPerItem: number;

  @Column({ name: 'estimated_value', type: 'int', nullable: true })
  estimatedValue: number;

  @Column({ name: 'food_type', type: 'varchar', length: 255, nullable: true })
  foodType: string;
}
