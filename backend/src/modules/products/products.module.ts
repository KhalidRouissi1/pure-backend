import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ImageService } from '../../common/services/image.service';
import { PrismaService } from '../../config/database';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ProductsController],
  providers: [ProductsService, ImageService, PrismaService],
  exports: [ProductsService],
})
export class ProductsModule {}
