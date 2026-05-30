import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { PrismaService } from '../../config/database';

@Module({
  controllers: [StoresController],
  providers: [StoresService, PrismaService],
  exports: [StoresService],
})
export class StoresModule {}
