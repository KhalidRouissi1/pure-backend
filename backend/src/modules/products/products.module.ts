import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ImageService } from '../../common/services/image.service';
import { PrismaService } from '../../config/database';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ImageService, PrismaService],
  exports: [ProductsService],
})
export class ProductsModule {}
