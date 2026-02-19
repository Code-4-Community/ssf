import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Donation } from '../donations/donations.entity';
import { Allocation } from '../allocations/allocations.entity';
import { FoodType } from './types';

@Entity('donation_items')
export class DonationItem {
  @PrimaryGeneratedColumn({ name: 'item_id' })
  itemId!: number;

  @Column({ name: 'donation_id', type: 'int' })
  donationId!: number;

  @ManyToOne(() => Donation, { nullable: false })
  @JoinColumn({ name: 'donation_id', referencedColumnName: 'donationId' })
  donation!: Donation;

  @Column({ name: 'item_name', type: 'varchar', length: 255 })
  itemName!: string;

  @Column({ name: 'quantity', type: 'int' })
  quantity!: number;

  @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
  reservedQuantity!: number;

  @Column({ name: 'oz_per_item', type: 'int', nullable: true })
  ozPerItem?: number | null;

  @Column({ name: 'estimated_value', type: 'int', nullable: true })
  estimatedValue?: number | null;

  @Column({
    name: 'food_type',
    type: 'enum',
    enum: FoodType,
    enumName: 'food_type_enum',
  })
  foodType!: FoodType;

  @OneToMany(() => Allocation, (allocation) => allocation.item)
  allocations!: Allocation[];
}
