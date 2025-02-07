import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('food_manufacturers')
export class FoodManufacturer {
  @PrimaryGeneratedColumn({ name: 'food_manufacturer_id' })
  foodManufacturerId: number;

  @Column({ name: 'food_manufacturer_name', type: 'varchar', length: 255 })
  foodManufacturerName: string;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'food_manufacturer_representative_id',
    referencedColumnName: 'user_id',
  })
  foodManufacturerRepresentative: User;
}
