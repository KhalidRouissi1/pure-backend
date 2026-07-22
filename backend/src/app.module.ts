import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './config/database';
import { UsersModule } from './modules/users/users.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { ProductsModule } from './modules/products/products.module';
import { StoresModule } from './modules/stores/stores.module';
import { AdminModule } from './modules/admin/admin.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    UsersModule,
    DiscoveryModule,
    ProductsModule,
    StoresModule,
    AdminModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
    AddressesModule,
  ],
  controllers: [HealthController],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [PrismaService],
})
export class AppModule {}
