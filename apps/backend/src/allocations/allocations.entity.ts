import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DonationItem } from '../donationItems/donationItems.entity';

@Entity('allocations')
export class Allocation {
  @PrimaryGeneratedColumn({ name: 'allocation_id' })
  allocationId: number;

  @Column({ name: 'order_id', type: 'int', nullable: false })
  orderId: number;

  @Column({ name: 'item_id', type: 'int' })
  itemId: number;

  @ManyToOne(() => DonationItem, (item) => item.allocations)
  @JoinColumn({ name: 'item_id' })
  item: DonationItem;

  @Column({ name: 'allocated_quantity', type: 'int' })
  allocatedQuantity: number;

  @Column({ name: 'reserved_at', type: 'timestamp' })
  reservedAt: Date;

  @Column({ name: 'fulfilled_at', type: 'timestamp' })
  fulfilledAt: Date;

  @Column({ name: 'status', type: 'varchar', length: 255 })
  status: string;
}
