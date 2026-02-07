import { registerAs } from '@nestjs/config';
import { PluralNamingStrategy } from '../strategies/plural-naming.strategy';
import { DataSource, DataSourceOptions } from 'typeorm';
import schemaMigrations from './migrations';

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
  migrations: [...schemaMigrations],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
