import { Module } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService, PrismaService],
  exports: [CartService],
})
export class CartModule {}
