import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + process.env.TYPEORM_ENTITIES],
      migrations: [process.env.TYPEORM_MIGRATIONS],
      logging: process.env.TYPEORM_LOGGING === 'true',
      synchronize: true,
      migrationsRun: process.env.TYPEORM_MIGRATION_RUN === 'true',
      migrationsTableName: 'migrations',
    }),
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
