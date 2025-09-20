import { registerAs } from '@nestjs/config';
import { PluralNamingStrategy } from '../strategies/plural-naming.strategy';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User1725726359198 } from '../migrations/1725726359198-User';
import { AddTables1726524792261 } from '../migrations/1726524792261-addTables';
import { ReviseTables1737522923066 } from '../migrations/1737522923066-reviseTables';
import { UpdateUserRole1737816745912 } from '../migrations/1737816745912-UpdateUserRole';
import { UpdatePantriesTable1737906317154 } from '../migrations/1737906317154-updatePantriesTable';
import { UpdatePantriesTable1738172265266 } from '../migrations/1738172265266-updatePantriesTable';
import { UpdatePantriesTable1739056029076 } from '../migrations/1739056029076-updatePantriesTable';
import { AssignmentsPantryIdNotUnique1758384669652 } from '../migrations/1758384669652-AssignmentsPantryIdNotUnique';

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
    UpdatePantriesTable1738172265266,
    UpdatePantriesTable1739056029076,
    AssignmentsPantryIdNotUnique1758384669652,
  ],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
