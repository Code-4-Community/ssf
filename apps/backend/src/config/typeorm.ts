import { registerAs } from '@nestjs/config';
import { PluralNamingStrategy } from '../strategies/plural-naming.strategy';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User1725726359198 } from '../migrations/1725726359198-User';
import { AddTables1726524792261 } from '../migrations/1726524792261-addTables';
import { ReviseTables1737522923066 } from '../migrations/1737522923066-reviseTables';
import { UpdateUserRole1737816745912 } from '../migrations/1737816745912-UpdateUserRole';
import { UpdatePantriesTable1737906317154 } from '../migrations/1737906317154-updatePantriesTable';
import { UpdateDonations1738697216020 } from '../migrations/1738697216020-updateDonations';
import { UpdateDonationColTypes1741708808976 } from '../migrations/1741708808976-UpdateDonationColTypes';
import { UpdatePantriesTable1738172265266 } from '../migrations/1738172265266-updatePantriesTable';
import { UpdatePantriesTable1739056029076 } from '../migrations/1739056029076-updatePantriesTable';
import { AssignmentsPantryIdNotUnique1758384669652 } from '../migrations/1758384669652-AssignmentsPantryIdNotUnique';
import { UpdateOrdersTable1740367964915 } from '../migrations/1740367964915-updateOrdersTable';
import { UpdateFoodRequests1744051370129 } from '../migrations/1744051370129-updateFoodRequests.ts';
import { UpdateRequestTable1741571847063 } from '../migrations/1741571847063-updateRequestTable';
import { RemoveOrderIdFromRequests1744133526650 } from '../migrations/1744133526650-removeOrderIdFromRequests.ts';
import { AddOrders1739496585940 } from '../migrations/1739496585940-addOrders';
import { UpdatePantriesTable1742739750279 } from '../migrations/1742739750279-updatePantriesTable';
import { UpdatePantryUserFields1731171000000 } from '../migrations/1731171000000-UpdatePantryUserFields';

const config = {
  type: 'postgres',
  host: `${process.env.DATABASE_HOST}`,
  port: parseInt(`${process.env.DATABASE_PORT}`, 10),
  database: `${process.env.DATABASE_NAME}`,
  username: `${process.env.DATABASE_USERNAME}`,
  password: `${process.env.DATABASE_PASSWORD}`,
  autoLoadEntities: true,
  synchronize: false,
  namingStrategy: new PluralNamingStrategy(),
  // Glob patterns (e.g. ../migrations/**.ts) are deprecated, so we have to manually specify each migration
  // TODO: see if there's still a way to dynamically load all migrations
  migrations: [
    User1725726359198,
    AddTables1726524792261,
    ReviseTables1737522923066,
    UpdateUserRole1737816745912,
    UpdatePantriesTable1737906317154,
    UpdateDonations1738697216020,
    UpdateDonationColTypes1741708808976,
    UpdatePantriesTable1738172265266,
    UpdatePantriesTable1739056029076,
    AssignmentsPantryIdNotUnique1758384669652,
    AddOrders1739496585940,
    UpdateOrdersTable1740367964915,
    UpdateRequestTable1741571847063,
    UpdateFoodRequests1744051370129,
    RemoveOrderIdFromRequests1744133526650,
    UpdatePantriesTable1742739750279,
    UpdatePantryUserFields1731171000000,
  ],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
