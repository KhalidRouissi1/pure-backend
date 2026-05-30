import { Module } from '@nestjs/common';
import { PrismaService } from '../config/database';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CommonModule {}
