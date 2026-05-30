import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from '../../config/database';
import { OrdersModule } from '../orders/orders.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [OrdersModule, ReviewsModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
})
export class AdminModule {}
