import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FoodRequest } from '../foodRequests/request.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Pantry, { nullable: false })
  @JoinColumn({
    name: 'pantry_id',
    referencedColumnName: 'pantryId',
  })
  pantry: Pantry;

  @ManyToOne(() => FoodRequest, { nullable: false })
  @JoinColumn({
    name: 'request_id',
    referencedColumnName: 'requestId',
  })
  request: FoodRequest;

  @ManyToOne(() => FoodManufacturer, { nullable: false })
  @JoinColumn({
    name: 'shipped_by',
    referencedColumnName: 'foodManufacturerId',
  })
  shippedBy: FoodManufacturer;

  // @Column({ name: 'request_id' }) // Foreign key for food request
  // requestId: number;

  // @ManyToOne(() => FoodRequest, { eager: false }) // Foreign relation to FoodRequest
  // @JoinColumn({ name: 'request_id' }) // Maps to requestId
  // foodRequest: FoodRequest;

  // @Column({ name: 'shipped_by', nullable: true }) // Foreign key for shipped by (manufacturer)
  // shippedBy: number;

  // @ManyToOne(() => FoodManufacturer, { eager: false, nullable: true }) // Foreign relation to FoodManufacturer
  // @JoinColumn({ name: 'shipped_by' }) // Maps to shippedBy
  // foodManufacturer?: FoodManufacturer;

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
