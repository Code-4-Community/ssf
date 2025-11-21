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

import { User1725726359198 } from '../migrations/1725726359198-User';
import { AddTables1726524792261 } from '../migrations/1726524792261-addTables';
import { ReviseTables1737522923066 } from '../migrations/1737522923066-reviseTables';
import { UpdateUserRole1737816745912 } from '../migrations/1737816745912-UpdateUserRole';
import { UpdatePantriesTable1737906317154 } from '../migrations/1737906317154-updatePantriesTable';
import { UpdatePantriesTable1738172265266 } from '../migrations/1738172265266-updatePantriesTable';
import { UpdateDonations1738697216020 } from '../migrations/1738697216020-updateDonations';
import { UpdatePantriesTable1739056029076 } from '../migrations/1739056029076-updatePantriesTable';
import { AddOrders1739496585940 } from '../migrations/1739496585940-addOrders';
import { UpdateOrdersTable1740367964915 } from '../migrations/1740367964915-updateOrdersTable';
import { UpdateRequestTable1741571847063 } from '../migrations/1741571847063-updateRequestTable';
import { UpdateDonationColTypes1741708808976 } from '../migrations/1741708808976-UpdateDonationColTypes';
import { UpdatePantriesTable1742739750279 } from '../migrations/1742739750279-updatePantriesTable';
import { UpdateFoodRequests1744051370129 } from '../migrations/1744051370129-updateFoodRequests';
import { RemoveOrderIdFromRequests1744133526650 } from '../migrations/1744133526650-removeOrderIdFromRequests';
import { AssignmentsPantryIdNotUnique1758384669652 } from '../migrations/1758384669652-AssignmentsPantryIdNotUnique';
import { CreateDummyData1759636753110 } from '../migrations/1759636753110-createDummyData';
import { RemoveOrdersDonationId1761500262238 } from '../migrations/1761500262238-RemoveOrdersDonationId';

const testConfig: DataSourceOptions = {
  type: 'postgres',
  host: `${process.env.DATABASE_HOST}`,
  port: parseInt(`${process.env.DATABASE_PORT}`, 10),
  database: `${process.env.DATABASE_NAME_TEST}`,
  username: `${process.env.DATABASE_USERNAME}`,
  password: `${process.env.DATABASE_PASSWORD}`,
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
  ],
  migrations: [
    User1725726359198,
    AddTables1726524792261,
    ReviseTables1737522923066,
    UpdateUserRole1737816745912,
    UpdatePantriesTable1737906317154,
    UpdatePantriesTable1738172265266,
    UpdateDonations1738697216020,
    UpdatePantriesTable1739056029076,
    AddOrders1739496585940,
    UpdateOrdersTable1740367964915,
    UpdateRequestTable1741571847063,
    UpdateDonationColTypes1741708808976,
    UpdatePantriesTable1742739750279,
    UpdateFoodRequests1744051370129,
    RemoveOrderIdFromRequests1744133526650,
    AssignmentsPantryIdNotUnique1758384669652,
    RemoveOrdersDonationId1761500262238,
    CreateDummyData1759636753110,
  ],
};

export const testDataSource = new DataSource(testConfig);
