import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const isTsEnv = __filename.endsWith('.ts');
const rootDir = isTsEnv ? 'src' : 'dist';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [join(process.cwd(), rootDir, '**', '*.entity.{ts,js}')],
  migrations: [join(process.cwd(), rootDir, 'migrations', '*.{ts,js}')],
} as DataSourceOptions);
