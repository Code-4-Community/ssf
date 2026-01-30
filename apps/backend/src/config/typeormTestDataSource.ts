import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { PluralNamingStrategy } from '../strategies/plural-naming.strategy';
import { Order } from '../orders/order.entity';
import { Pantry } from '../pantries/pantries.entity';
import { User } from '../users/user.entity';
import { Donation } from '../donations/donations.entity';
import { FoodManufacturer } from '../foodManufacturers/manufacturer.entity';
import { FoodRequest } from '../foodRequests/request.entity';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Allocation } from '../allocations/allocations.entity';
import { Assignments } from '../volunteerAssignments/volunteerAssignments.entity';
import migrations from './migrations';

const testConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  database: process.env.DATABASE_NAME_TEST ?? 'securing-safe-food-test',
  username: process.env.DATABASE_USERNAME ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  synchronize: false,
  namingStrategy: new PluralNamingStrategy(),
  entities: [
    Order,
    Pantry,
    User,
    Donation,
    FoodManufacturer,
    FoodRequest,
    DonationItem,
    Allocation,
    Assignments,
  ],
  migrations: migrations
};

export const testDataSource = new DataSource(testConfig);
