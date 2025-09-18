import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity('food_requests')
export class FoodRequest {
  @PrimaryGeneratedColumn({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'pantry_id', type: 'int' })
  pantryId: number;

  @Column({ name: 'requested_size', type: 'varchar', length: 50 })
  requestedSize: string;

  @Column({ name: 'requested_items', type: 'text', array: true })
  requestedItems: string[];

  @Column({ name: 'additional_information', type: 'text', nullable: true })
  additionalInformation: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ name: 'fulfilled_by', type: 'int', nullable: true })
  fulfilledBy: number;

  @CreateDateColumn({
    name: 'requested_at',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  requestedAt: Date;

  @Column({ name: 'date_received', type: 'timestamp', nullable: true })
  dateReceived: Date;

  @Column({ name: 'feedback', type: 'text', nullable: true })
  feedback: string;

  @Column({ name: 'photos', type: 'text', array: true, nullable: true })
  photos: string[];

  @OneToOne(() => Order, (order) => order.request, { nullable: true })
  order: Order;
}
