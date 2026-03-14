import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Order } from '../orders/order.entity';

@Entity('allocations')
export class Allocation {
  @PrimaryGeneratedColumn({ name: 'allocation_id' })
  allocationId!: number;

  @Column({ name: 'order_id', type: 'int' })
  orderId!: number;

  @ManyToOne(() => Order, (order) => order.allocations)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'item_id', type: 'int' })
  itemId!: number;

  @ManyToOne(() => DonationItem, (item) => item.allocations)
  @JoinColumn({ name: 'item_id' })
  item!: DonationItem;

  @Column({ name: 'allocated_quantity', type: 'int' })
  allocatedQuantity!: number;
}
