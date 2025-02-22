import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { FoodRequest } from '../foodRequests/request.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => FoodRequest, { nullable: false })
  @JoinColumn({
    name: 'request_id',
    referencedColumnName: 'requestId',
  })
  requestId: FoodRequest;

  @ManyToOne(() => Pantry, { nullable: false })
  @JoinColumn({
    name: 'pantry_id',
    referencedColumnName: 'pantryId',
  })
  pantryId: Pantry;

  @ManyToOne(() => FoodManufacturer, { nullable: false })
  @JoinColumn({
    name: 'shipped_by',
    referencedColumnName: 'foodManufacturerId',
  })
  shippedBy: FoodManufacturer;

  @Column({ name: 'status', type: 'varchar', length: 25, default: 'pending' })
  status: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @CreateDateColumn({
    name: 'shipped_at',
    type: 'timestamp',
  })
  shippedAt: Date;

  @CreateDateColumn({
    name: 'delivered_at',
    type: 'timestamp',
  })
  deliveredAt: Date;
}
