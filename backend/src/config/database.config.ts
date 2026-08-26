import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from 'src/database/entities';

export const databaseConfig = TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5433'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'asistent_messenger_ai',
  entities,
  synchronize: true, // SOLO DEV
});
