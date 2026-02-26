import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../orders/order.entity';
import { RequestSize, FoodRequestStatus } from './types';
import { Pantry } from '../pantries/pantries.entity';

@Entity('food_requests')
export class FoodRequest {
  @PrimaryGeneratedColumn({ name: 'request_id' })
  requestId!: number;

  @Column({ name: 'pantry_id', type: 'int' })
  pantryId!: number;

  @ManyToOne(() => Pantry, { nullable: false })
  @JoinColumn({ name: 'pantry_id', referencedColumnName: 'pantryId' })
  pantry!: Pantry;

  @Column({
    name: 'requested_size',
    type: 'enum',
    enum: RequestSize,
    enumName: 'request_size_enum',
  })
  requestedSize!: RequestSize;

  @Column({ name: 'requested_items', type: 'text', array: true })
  requestedItems!: string[];

  @Column({ name: 'additional_information', type: 'text', nullable: true })
  additionalInformation!: string | null;

  @CreateDateColumn({
    name: 'requested_at',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  requestedAt!: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enumName: 'food_requests_status_enum',
    enum: FoodRequestStatus,
    default: FoodRequestStatus.ACTIVE,
  })
  status: FoodRequestStatus;

  @OneToMany(() => Order, (order) => order.request, { nullable: true })
  orders!: Order[] | null;
}
