import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../orders/order.entity';
import { RequestSize } from './types';

@Entity('food_requests')
export class FoodRequest {
  @PrimaryGeneratedColumn({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'pantry_id', type: 'int' })
  pantryId: number;

  @Column({
    name: 'requested_size',
    type: 'enum',
    enum: RequestSize,
    enumName: 'request_size_enum',
  })
  requestedSize: RequestSize;

  @Column({ name: 'requested_items', type: 'text', array: true })
  requestedItems: string[];

  @Column({ name: 'additional_information', type: 'text', nullable: true })
  additionalInformation: string;

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

  @OneToMany(() => Order, (order) => order.request, { nullable: true })
  orders: Order[];
}
