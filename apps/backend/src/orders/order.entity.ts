import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { FoodRequest } from '../foodRequests/request.entity';
import { Pantry } from '../pantries/pantries.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { Donation } from '../donations/donations.entity';

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

  @OneToOne(() => FoodRequest, { nullable: false })
  @JoinColumn({
    name: 'request_id',
    referencedColumnName: 'requestId',
  })
  request: FoodRequest;

  @Column({ name: 'request_id' })
  requestId: number;

  @ManyToOne(() => FoodManufacturer, { nullable: true })
  @JoinColumn({
    name: 'shipped_by',
    referencedColumnName: 'foodManufacturerId',
  })
  foodManufacturer: FoodManufacturer;

  @Column({ name: 'shipped_by', nullable: true })
  shippedBy: number;

  @ManyToOne(() => Donation, { nullable: false })
  @JoinColumn({
    name: 'donation_id',
    referencedColumnName: 'donationId',
  })
  donation: Donation;

  @Column({ name: 'status', type: 'varchar', length: 25, default: 'pending' })
  status: string;

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
