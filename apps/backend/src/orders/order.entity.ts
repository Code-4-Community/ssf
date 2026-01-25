import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FoodRequest } from '../foodRequests/request.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { OrderStatus } from './types';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => FoodRequest, { nullable: false })
  @JoinColumn({
    name: 'request_id',
    referencedColumnName: 'requestId',
  })
  request: FoodRequest;

  @Column({ name: 'request_id' })
  requestId: number;

  @ManyToOne(() => FoodManufacturer, { nullable: false })
  @JoinColumn({
    name: 'shipped_by',
    referencedColumnName: 'foodManufacturerId',
  })
  foodManufacturer: FoodManufacturer;

  @Column({ name: 'shipped_by', nullable: true })
  shippedBy: number;

  @Column({
    name: 'status',
    type: 'enum',
    enumName: 'orders_status_enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @Column({
    name: 'shipped_at',
    type: 'timestamp',
    nullable: true,
  })
  shippedAt: Date | null;

  @Column({
    name: 'delivered_at',
    type: 'timestamp',
    nullable: true,
  })
  deliveredAt: Date | null;
}
