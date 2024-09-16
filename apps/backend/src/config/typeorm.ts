import { registerAs } from '@nestjs/config';
import { PluralNamingStrategy } from '../strategies/plural-naming.strategy';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User1725726359198 } from '../migrations/1725726359198-User';
import { AddTables1726524792261 } from '../migrations/1726524792261-addTables';

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
  migrations: [User1725726359198, AddTables1726524792261],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
